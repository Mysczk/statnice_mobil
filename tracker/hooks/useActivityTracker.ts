import { useState, useRef, useCallback, useEffect } from 'react';
import { Accelerometer, Pedometer } from 'expo-sensors';
import { createSession, endSession, insertSample } from '@/lib/database';
import {
  requestNotificationPermission,
  scheduleInactivityNotification,
  cancelInactivityNotification,
} from '@/lib/notifications';
import {
  SAMPLE_INTERVAL_MS,
  ACCEL_UPDATE_MS,
  GRAVITY,
  INTENSITY_THRESHOLD,
  NOTIFICATION_DELAY_SECONDS,
  NOTIFICATION_THROTTLE_MS,
  LOCATION_UPDATE_MS,
  R_EARTH,
} from '@/constants/constants';
import * as Location from 'expo-location';

/**
 * Výpočet intenzity pohybu z dat akcelerometru.
 * Magnitude vektoru zrychlení: mag = √(x² + y² + z²)
 * Odečtením gravitace (1g) získáme čistý pohyb, normalizujeme na 0–1.
 * Zdroj: https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion
 */
function calcIntensity(x: number, y: number, z: number): number {
  const mag = Math.sqrt(x * x + y * y + z * z);
  const delta = Math.abs(mag - GRAVITY);
  return Math.min(delta / 2.0, 1.0);
}

/**
 * Výpočet vzdálenosti mezi dvěma GPS souřadnicemi — Haversine formula.
 * Zdroj: https://www.movable-type.co.uk/scripts/latlong.html
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_EARTH * c;
}

export function useActivityTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentIntensity, setCurrentIntensity] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const samplesRef = useRef<{ steps: number; intensity: number }[]>([]);
  const stepCountRef = useRef(0);
  const initialStepsRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sampleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pedometerSubRef = useRef<{ remove: () => void } | null>(null);
  const accelSubRef = useRef<{ remove: () => void } | null>(null);
  const lastNotifRescheduleRef = useRef(0);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const lastLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const distanceRef = useRef(0);

  useEffect(() => {
    Pedometer.isAvailableAsync().then(setIsPedometerAvailable);
  }, []);

  const start = useCallback(async () => {
    const id = createSession();
    setSessionId(id);
    setStepCount(0);
    setElapsedSeconds(0);
    setDistanceMeters(0);
    stepCountRef.current = 0;
    initialStepsRef.current = null;
    samplesRef.current = [];
    startTimeRef.current = Date.now();
    lastNotifRescheduleRef.current = 0;
    distanceRef.current = 0;
    lastLocationRef.current = null;

    // Notifikace po 5 minutách neaktivity
    await requestNotificationPermission();
    await scheduleInactivityNotification(NOTIFICATION_DELAY_SECONDS);

    // Akcelerometr — pouze pro intenzitu pohybu
    Accelerometer.setUpdateInterval(ACCEL_UPDATE_MS);
    accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
      accelRef.current = { x, y, z };
      const intensity = calcIntensity(x, y, z);
      setCurrentIntensity(intensity);

      // Při pohybu odlož notifikaci — max jednou za 30s (throttle)
      if (intensity > INTENSITY_THRESHOLD) {
        const now = Date.now();
        if (now - lastNotifRescheduleRef.current > NOTIFICATION_THROTTLE_MS) {
          lastNotifRescheduleRef.current = now;
          scheduleInactivityNotification(NOTIFICATION_DELAY_SECONDS);
        }
      }
    });

    // GPS — odhad vzdálenosti pomocí Haversine formula
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      locationSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: LOCATION_UPDATE_MS,
          distanceInterval: 5, // min. 5 metrů změna
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          if (lastLocationRef.current !== null) {
            const d = haversineDistance(
              lastLocationRef.current.lat,
              lastLocationRef.current.lon,
              latitude,
              longitude
            );
            // Filtruj GPS šum — ignoruj skoky větší než 50m za 5s
            if (d < 50) {
              distanceRef.current += d;
              setDistanceMeters(distanceRef.current);
            }
          }
          lastLocationRef.current = { lat: latitude, lon: longitude };
        }
      );
    }

    // Pedometr — systémový počet kroků (iOS CoreMotion / Android Step Counter)
    // První update slouží jako baseline — od ní počítáme delta.
    // watchStepCount a getStepCountAsync používají různé čítače,
    // proto baseline bereme z prvního watchStepCount updatu.
    // Zdroj: https://docs.expo.dev/versions/latest/sdk/pedometer/
    if (isPedometerAvailable) {
      pedometerSubRef.current = Pedometer.watchStepCount((result) => {
        if (initialStepsRef.current === null) {
          initialStepsRef.current = result.steps;
        }
        const delta = result.steps - initialStepsRef.current;
        stepCountRef.current = delta;
        setStepCount(delta);
      });
    }

    // Hodinky — elapsed time
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Ukládání vzorků do DB každé 3s
    sampleTimerRef.current = setInterval(() => {
      const { x, y, z } = accelRef.current;
      const intensity = calcIntensity(x, y, z);
      insertSample(id, stepCountRef.current, intensity);
      samplesRef.current.push({ steps: stepCountRef.current, intensity });
    }, SAMPLE_INTERVAL_MS);

    setIsTracking(true);
  }, [isPedometerAvailable]);

  const stop = useCallback(() => {
    if (sessionId === null) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (sampleTimerRef.current) clearInterval(sampleTimerRef.current);

    cancelInactivityNotification();

    accelSubRef.current?.remove();
    accelSubRef.current = null;

    pedometerSubRef.current?.remove();
    pedometerSubRef.current = null;

    locationSubRef.current?.remove();
    locationSubRef.current = null;

    const samples = samplesRef.current;
    const avgIntensity =
      samples.length > 0
        ? samples.reduce((s, r) => s + r.intensity, 0) / samples.length
        : 0;

    endSession(sessionId, stepCountRef.current, avgIntensity, distanceRef.current);
    setIsTracking(false);

    return sessionId;
  }, [sessionId]);

  // Cleanup při unmountu komponenty
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sampleTimerRef.current) clearInterval(sampleTimerRef.current);
      accelSubRef.current?.remove();
      pedometerSubRef.current?.remove();
      locationSubRef.current?.remove();
    };
  }, []);

  return {
    isTracking,
    sessionId,
    currentIntensity,
    stepCount,
    elapsedSeconds,
    distanceMeters,
    isPedometerAvailable,
    start,
    stop,
  };
}
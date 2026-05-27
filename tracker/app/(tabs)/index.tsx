import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { formatTime } from '@/lib/formatter';
import { INTENSITY_LABELS, INTENSITY_COLORS, INTENSITY_THRESHOLDS } from '@/constants/constants';

function intensityLabel(v: number): string {
  if (v < INTENSITY_THRESHOLDS[0]) return INTENSITY_LABELS[0];
  if (v < INTENSITY_THRESHOLDS[1]) return INTENSITY_LABELS[1];
  if (v < INTENSITY_THRESHOLDS[2]) return INTENSITY_LABELS[2];
  return INTENSITY_LABELS[3];
}

function intensityColor(v: number): string {
  if (v < INTENSITY_THRESHOLDS[0]) return INTENSITY_COLORS[0];
  if (v < INTENSITY_THRESHOLDS[1]) return INTENSITY_COLORS[1];
  if (v < INTENSITY_THRESHOLDS[2]) return INTENSITY_COLORS[2];
  return INTENSITY_COLORS[3];
}

export default function TrackScreen() {
  const router = useRouter();
  const { isTracking, currentIntensity, stepCount, elapsedSeconds, distanceMeters, start, stop } = useActivityTracker();

  const handleStop = () => {
    Alert.alert('Ukončit měření', 'Opravdu chceš ukončit měření?', [
      { text: 'Zrušit', style: 'cancel' },
      {
        text: 'Ukončit',
        style: 'destructive',
        onPress: () => {
          const id = stop();
          if (id) router.push(`/session/${id}`);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>Čas měření</Text>
        <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
      </View>

      {/* Intenzita — celá šířka */}
      <View style={styles.intensityCard}>
        <Text style={[styles.intensityValue, { color: intensityColor(currentIntensity) }]}>
          {intensityLabel(currentIntensity)}
        </Text>
        <Text style={styles.statLabel}>Intenzita</Text>
      </View>

      {/* Kroky + Vzdálenost vedle sebe */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stepCount}</Text>
          <Text style={styles.statLabel}>Kroky</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {distanceMeters >= 1000
              ? `${(distanceMeters / 1000).toFixed(2)}`
              : `${Math.round(distanceMeters)}`}
          </Text>
          <Text style={styles.statLabel}>
            {distanceMeters >= 1000 ? 'kilometry' : 'metry'}
          </Text>
        </View>
      </View>

      {isTracking && (
        <View style={styles.intensityBar}>
          <View
            style={[
              styles.intensityFill,
              {
                width: `${currentIntensity * 100}%`,
                backgroundColor: intensityColor(currentIntensity),
              },
            ]}
          />
        </View>
      )}

      {!isTracking ? (
        <Pressable style={[styles.btn, styles.btnStart]} onPress={start}>
          <Text style={styles.btnText}>▶  Zahájit měření</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.btn, styles.btnStop]} onPress={handleStop}>
          <Text style={styles.btnText}>⏹  Ukončit měření</Text>
          </Pressable>
          
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  intensityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  intensityValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timerLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  intensityBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 4,
  },
  btn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnStart: { backgroundColor: '#00C896' },
  btnStop: { backgroundColor: '#FF3B30' },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSession, getSamplesForSession, Session, Sample } from '@/lib/database';
import { LineChart } from 'react-native-chart-kit';
import { formatDate, formatDuration } from '@/lib/formatter';
import { exportSessionAsCSV, exportSessionAsJSON } from '@/lib/export';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    if (!id) return;
    const numId = parseInt(id, 10);
    setSession(getSession(numId));
    setSamples(getSamplesForSession(numId));
  }, [id]);

  if (!session) {
    return (
      <View style={styles.center}>
        <Text>Načítání…</Text>
      </View>
    );
  }

  const maxIntensity = samples.length > 0 ? Math.max(...samples.map((s) => s.intensity)) : 0;
  const chartWidth = Dimensions.get('window').width - 48;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Statistiky */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiky</Text>
        <View style={styles.statsGrid}>
          <StatTile label="Délka aktivity" value={formatDuration(session.started_at, session.ended_at)} />
          <StatTile label="Celkem kroků" value={session.total_steps.toString()} />
          <StatTile
            label="Vzdálenost"
            value={
              session.distance_meters >= 1000
                ? `${(session.distance_meters / 1000).toFixed(2)} km`
                : `${Math.round(session.distance_meters)} m`
            }
          />
          <StatTile
            label="Průměrná intenzita"
            value={`${(session.avg_intensity * 100).toFixed(1)} %`}
          />
          <StatTile
            label="Max. intenzita"
            value={`${(maxIntensity * 100).toFixed(1)} %`}
          />
        </View>
      </View>

      {/* Časy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Časy</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Zahájeno" value={formatDate(session.started_at)} />
          {session.ended_at && (
            <InfoRow label="Ukončeno" value={formatDate(session.ended_at)} />
          )}
          <InfoRow label="Počet vzorků" value={samples.length.toString()} />
        </View>
      </View>

        {samples.length > 1 && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Graf intenzity</Text>
            <View style={styles.chartCard}>
            <LineChart
                data={{
                    labels: samples.map((_, i) =>
                    i % Math.ceil(samples.length / 5) === 0
                        ? new Date(samples[i].recorded_at).toLocaleTimeString('cs-CZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                        : ''
                    ),
                    datasets: [{ data: samples.map((s) => s.intensity) }],
                }}
                width={chartWidth}
                height={180}
                yAxisSuffix=""
                yAxisInterval={1}
                fromZero
                chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(0, 200, 150, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
                    propsForDots: {
                    r: '3',
                    strokeWidth: '2',
                    stroke: '#00C896',
                    },
                }}
                bezier
                style={{ borderRadius: 12 }}
                />
            </View>
        </View>
        )}


      {/* Vzorky */}
      {samples.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Průběh měření</Text>
          <View style={styles.infoCard}>
            {samples.map((sample, i) => (
              <View key={sample.id} style={styles.sampleRow}>
                <Text style={styles.sampleIndex}>#{i + 1}</Text>
                <Text style={styles.sampleTime}>
                  {new Date(sample.recorded_at).toLocaleTimeString('cs-CZ')}
                </Text>
                <Text style={styles.sampleSteps}>👟 {sample.steps}</Text>
                <View style={styles.sampleBarWrap}>
                  <View
                    style={[
                      styles.sampleBar,
                      { width: `${sample.intensity * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.sampleIntensity}>
                  {(sample.intensity * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
      <Text style={styles.sectionTitle}>Export</Text>
      <View style={styles.exportRow}>
        <Pressable
          style={[styles.exportBtn, { backgroundColor: '#00C896' }]}
          onPress={() => exportSessionAsCSV(session.id).catch(() =>
            Alert.alert('Chyba', 'Export se nezdařil.')
          )}
        >
          <Text style={styles.exportBtnText}>Exportovat CSV</Text>
        </Pressable>
        <Pressable
          style={[styles.exportBtn, { backgroundColor: '#007AFF' }]}
          onPress={() => exportSessionAsJSON(session.id).catch(() =>
            Alert.alert('Chyba', 'Export se nezdařil.')
          )}
        >
          <Text style={styles.exportBtnText}>Exportovat JSON</Text>
        </Pressable>
      </View>
    </View>
    </ScrollView>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statTileValue}>{value}</Text>
      <Text style={styles.statTileLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statTileValue: { fontSize: 22, fontWeight: '700', color: '#00C896' },
  statTileLabel: { fontSize: 11, color: '#8E8E93', marginTop: 4, textAlign: 'center' },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 14, color: '#8E8E93' },
  infoValue: { fontSize: 14, color: '#1C1C1E', fontWeight: '500' },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sampleIndex: { fontSize: 11, color: '#C7C7CC', width: 24 },
  sampleTime: { fontSize: 12, color: '#636366', width: 70 },
  sampleSteps: { fontSize: 12, color: '#1C1C1E', width: 55 },
  sampleBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sampleBar: { height: '100%', backgroundColor: '#00C896', borderRadius: 3 },
  sampleIntensity: { fontSize: 12, color: '#636366', width: 35, textAlign: 'right' },
  chartCard: {
  backgroundColor: '#fff',
  borderRadius: 14,
  padding: 8,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
  alignItems: 'center' as const,
  },
  exportRow: {
  flexDirection: 'row',
  gap: 12,
},
exportBtn: {
  flex: 1,
  paddingVertical: 14,
  borderRadius: 14,
  alignItems: 'center',
},
exportBtnText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '600',
},
});
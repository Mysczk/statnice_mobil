import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getSessions, deleteSession, Session } from '@/lib/database';
import { formatDate, formatDuration } from '@/lib/formatter';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const router = useRouter();

  const load = useCallback(() => {
    setSessions(getSessions());
  }, []);

  useFocusEffect(load);

  const handleDelete = (id: number) => {
    deleteSession(id);
    load();
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🏃</Text>
        <Text style={styles.emptyText}>Zatím žádná měření</Text>
        <Text style={styles.emptyHint}>Zahaj první měření na záložce Měřit</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/session/${item.id}`)}>
          <View style={styles.cardMain}>
            <Text style={styles.cardDate}>{formatDate(item.started_at)}</Text>
            <Text style={styles.cardDuration}>{formatDuration(item.started_at, item.ended_at)}</Text>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.cardStat}>👟 {item.total_steps} kroků</Text>
            <Text style={styles.cardStat}>
              ⚡ {(item.avg_intensity * 100).toFixed(0)}% intenzita
            </Text>
          </View>
          <Pressable
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={8}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </Pressable>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F2F2F7',
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  emptyHint: { fontSize: 14, color: '#8E8E93' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 24, 
  },
  cardDate: { fontSize: 14, color: '#3C3C43', fontWeight: '500' },
  cardDuration: { fontSize: 16, fontWeight: '700', color: '#00C896' },
  cardStats: { flexDirection: 'row', gap: 16 },
  cardStat: { fontSize: 13, color: '#636366' },
  deleteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B3020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: '#FF3B30', fontSize: 11, fontWeight: '700' },
});
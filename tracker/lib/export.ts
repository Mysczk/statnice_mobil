import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getSamplesForSession, getSession } from '@/lib/database';

export async function exportSessionAsCSV(sessionId: number): Promise<void> {
  const session = getSession(sessionId);
  const samples = getSamplesForSession(sessionId);

  if (!session) return;

  const header = 'cas,kroky,intenzita\n';
  const rows = samples
    .map((s) => `${new Date(s.recorded_at).toISOString()},${s.steps},${s.intensity.toFixed(4)}`)
    .join('\n');

  const csv = header + rows;
  const filename = `aktivita_${sessionId}_${Date.now()}.csv`;

  const file = new File(Paths.document, filename);
  file.create();
  file.write(csv);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Exportovat měření',
    });
  }
}

export async function exportSessionAsJSON(sessionId: number): Promise<void> {
  const session = getSession(sessionId);
  const samples = getSamplesForSession(sessionId);

  if (!session) return;

  const data = {
    session: {
      id: session.id,
      started_at: new Date(session.started_at).toISOString(),
      ended_at: session.ended_at ? new Date(session.ended_at).toISOString() : null,
      total_steps: session.total_steps,
      avg_intensity: session.avg_intensity,
    },
    samples: samples.map((s) => ({
      recorded_at: new Date(s.recorded_at).toISOString(),
      steps: s.steps,
      intensity: s.intensity,
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const filename = `aktivita_${sessionId}_${Date.now()}.json`;

  const file = new File(Paths.document, filename);
  file.create();
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Exportovat měření',
    });
  }
}
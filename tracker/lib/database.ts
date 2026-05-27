import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('activity.db');

export interface Session {
  id: number;
  started_at: number;
  ended_at: number | null;
  total_steps: number;
  avg_intensity: number;
  distance_meters: number;
}

export interface Sample {
  id: number;
  session_id: number;
  recorded_at: number;
  steps: number;
  intensity: number;
}

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at  INTEGER NOT NULL,
      ended_at    INTEGER,
      total_steps INTEGER DEFAULT 0,
      avg_intensity REAL DEFAULT 0,
      distance_meters REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS samples (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  INTEGER NOT NULL,
      recorded_at INTEGER NOT NULL,
      steps       INTEGER NOT NULL,
      intensity   REAL NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);
  try {
    db.execSync('ALTER TABLE sessions ADD COLUMN distance_meters REAL DEFAULT 0');
  } catch {
    
  }
}

export function createSession(): number {
  const result = db.runSync(
    'INSERT INTO sessions (started_at) VALUES (?)',
    Date.now()
  );
  return result.lastInsertRowId;
}

export function endSession(id: number, totalSteps: number, avgIntensity: number, distanceMeters: number) {
  db.runSync(
    'UPDATE sessions SET ended_at = ?, total_steps = ?, avg_intensity = ?, distance_meters = ? WHERE id = ?',
    Date.now(), totalSteps, avgIntensity, distanceMeters, id
  );
}

export function getSessions(): Session[] {
  return db.getAllSync<Session>('SELECT * FROM sessions ORDER BY started_at DESC');
}

export function getSession(id: number): Session | null {
  return db.getFirstSync<Session>('SELECT * FROM sessions WHERE id = ?', id) ?? null;
}

// Samples
export function insertSample(sessionId: number, steps: number, intensity: number) {
  db.runSync(
    'INSERT INTO samples (session_id, recorded_at, steps, intensity) VALUES (?, ?, ?, ?)',
    sessionId, Date.now(), steps, intensity
  );
}

export function getSamplesForSession(sessionId: number): Sample[] {
  return db.getAllSync<Sample>(
    'SELECT * FROM samples WHERE session_id = ? ORDER BY recorded_at ASC',
    sessionId
  );
}

export function deleteSession(id: number) {
  db.runSync('DELETE FROM samples WHERE session_id = ?', id);
  db.runSync('DELETE FROM sessions WHERE id = ?', id);
}
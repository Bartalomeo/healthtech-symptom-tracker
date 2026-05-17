import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://healthtech:healthtech_secure_pass_2024@healthtech_postgres:5432/healthtech',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
  return result;
}

export const userQueries = {
  createUser: async (email: string, name: string) => {
    const result = await query(
      'INSERT INTO users (email, name, created_at) VALUES ($1, $2, NOW()) RETURNING id, email, name',
      [email, name]
    );
    return result.rows[0];
  },
  getUserByEmail: async (email: string) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  getUserById: async (id: string) => {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
};

export const symptomQueries = {
  create: async (userId: string, data: any) => {
    const result = await query(
      `INSERT INTO symptoms (user_id, name, severity, triggers, notes, recorded_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, data.name, data.severity, JSON.stringify(data.triggers || []), data.notes, data.recorded_at || new Date()]
    );
    return result.rows[0];
  },
  getByUserId: async (userId: string, limit = 100) => {
    const result = await query(
      'SELECT * FROM symptoms WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  },
  getById: async (id: string) => {
    const result = await query('SELECT * FROM symptoms WHERE id = $1', [id]);
    return result.rows[0];
  },
  update: async (id: string, userId: string, data: any) => {
    const result = await query(
      `UPDATE symptoms 
       SET name = COALESCE($1, name), 
           severity = COALESCE($2, severity), 
           triggers = COALESCE($3, triggers), 
           notes = COALESCE($4, notes)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [data.name, data.severity, data.triggers ? JSON.stringify(data.triggers) : null, data.notes, id, userId]
    );
    return result.rows[0];
  },
  delete: async (id: string, userId: string) => {
    const result = await query(
      'DELETE FROM symptoms WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0];
  },
};

export const patternQueries = {
  create: async (userId: string, trigger: string, symptoms: string[]) => {
    const result = await query(
      `INSERT INTO patterns (user_id, trigger_name, associated_symptoms, created_at) 
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [userId, trigger, JSON.stringify(symptoms)]
    );
    return result.rows[0];
  },
  getByUserId: async (userId: string) => {
    const result = await query(
      'SELECT * FROM patterns WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },
};

export default pool;
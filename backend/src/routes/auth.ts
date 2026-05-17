import { NextApiRequest, NextApiResponse } from 'next-auth/node';
import NextAuth from 'next-auth';
import { Pool } from 'pg';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://healthtech:healthtech_secure_pass_2024@healthtech_postgres:5432/healthtech',
});

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER || '',
      from: process.env.EMAIL_FROM || '',
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) { token.id = user.id; }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) { (session.user as any).id = token.id; }
      return session;
    },
  },
  adapter: {
    async createUser(user: any) {
      const result = await pool.query(
        'INSERT INTO users (email, name, created_at) VALUES ($1, $2, NOW()) RETURNING id',
        [user.email, user.name || 'User']
      );
      return { ...user, id: result.rows[0].id };
    },
    async getUser(id: string) {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    },
    async getUserByEmail(email: string) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    },
    async updateUser(user: any) {
      const result = await pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [user.name, user.email, user.id]
      );
      return result.rows[0];
    },
    async deleteUser(id: string) {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
    },
  },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => {
  NextAuth(req, res, authOptions);
};

export default authHandler;
export { authOptions };
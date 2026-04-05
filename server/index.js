'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'polydreamer-jwt-secret-change-in-production';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'polydreamer.db');

// --- Database setup ---
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const findByEmail = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE');
const findById   = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
const insertUser = db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)');

// --- Express setup ---
const app = express();
app.use(express.json());

function makeToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.claims = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  if (findByEmail.get(email))
    return res.status(409).json({ error: 'An account with this email already exists.' });

  const hash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();
  insertUser.run(id, name.trim(), email.trim().toLowerCase(), hash);

  const user = { id, name: name.trim(), email: email.trim().toLowerCase() };
  res.status(201).json({ token: makeToken(user), user });
});

// POST /api/auth/signin
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  const row = findByEmail.get(email);
  if (!row) return res.status(401).json({ error: 'Invalid email or password.' });

  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

  const user = { id: row.id, name: row.name, email: row.email };
  res.json({ token: makeToken(user), user });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const row = findById.get(req.claims.sub);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ user: row });
});

// POST /api/auth/signout (client drops the token; server-side no-op)
app.post('/api/auth/signout', authMiddleware, (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`PolyDreamer API server listening on 127.0.0.1:${PORT}`);
});

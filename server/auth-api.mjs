import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFile = path.join(__dirname, 'auth-data.json')
const port = Number(process.env.AUTH_PORT || 3002)

const DUMMY_AUTH_USER = {
  name: 'Demo Admin',
  email: 'demo@franchisecrm.local',
  password: 'demo123',
  role: 'Admin',
}

function publicUser(user) {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function createToken() {
  return crypto.randomBytes(32).toString('hex')
}

async function readData() {
  try {
    const contents = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(contents)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { users: [DUMMY_AUTH_USER], sessions: {} }
    }
    throw error
  }
}

async function saveData(data) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8')
}

async function ensureDataFile() {
  try {
    await fs.access(dataFile)
  } catch {
    await saveData({ users: [DUMMY_AUTH_USER], sessions: {} })
  }
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase()
}

function extractToken(req) {
  const authHeader = req.get('Authorization') || ''
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  return null
}

const app = express()
app.use(express.json())

// Very small CORS helper so requests from the browser won't be blocked
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// POST /api/method/franchise_crm.franchise_crm.api.auth_api.signup
app.post('/api/method/franchise_crm.franchise_crm.api.auth_api.signup', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' })
  }

  const normalizedEmail = normalizeEmail(email)
  const data = await readData()

  if (data.users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const newUser = {
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    role: 'Admin',
  }

  data.users.push(newUser)
  const token = createToken()
  data.sessions[token] = normalizedEmail
  await saveData(data)

  return res.status(201).json({ message: 'ok', user: publicUser(newUser), token })
})

app.post('/api/method/franchise_crm.api.auth_api.signup', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' })
  }

  const normalizedEmail = normalizeEmail(email)
  const data = await readData()

  if (data.users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const newUser = {
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    role: 'Admin',
  }

  data.users.push(newUser)
  const token = createToken()
  data.sessions[token] = normalizedEmail
  await saveData(data)

  return res.status(201).json({ message: 'ok', user: publicUser(newUser), token })
})

// POST /api/method/franchise_crm.franchise_crm.api.auth_api.login
app.post('/api/method/franchise_crm.franchise_crm.api.auth_api.login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const normalizedEmail = normalizeEmail(email)
  const data = await readData()
  const matchedUser = data.users.find(
    (user) => user.email === normalizedEmail && user.password === String(password)
  )

  if (!matchedUser) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const token = createToken()
  data.sessions[token] = normalizedEmail
  await saveData(data)

  return res.json({ message: 'ok', user: publicUser(matchedUser), token })
})

app.post('/api/method/franchise_crm.api.auth_api.login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const normalizedEmail = normalizeEmail(email)
  const data = await readData()
  const matchedUser = data.users.find(
    (user) => user.email === normalizedEmail && user.password === String(password)
  )

  if (!matchedUser) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const token = createToken()
  data.sessions[token] = normalizedEmail
  await saveData(data)

  return res.json({ message: 'ok', user: publicUser(matchedUser), token })
})

// POST /api/method/franchise_crm.franchise_crm.api.auth_api.logout
app.post('/api/method/franchise_crm.franchise_crm.api.auth_api.logout', async (req, res) => {
  const token = extractToken(req) || req.body?.token
  if (!token) return res.status(400).json({ error: 'Missing token' })

  const data = await readData()
  if (data.sessions[token]) {
    delete data.sessions[token]
    await saveData(data)
  }

  return res.json({ message: 'ok' })
})

app.post('/api/method/franchise_crm.api.auth_api.logout', async (req, res) => {
  const token = extractToken(req) || req.body?.token
  if (!token) return res.status(400).json({ error: 'Missing token' })

  const data = await readData()
  if (data.sessions[token]) {
    delete data.sessions[token]
    await saveData(data)
  }

  return res.json({ message: 'ok' })
})

// GET /api/method/franchise_crm.franchise_crm.api.auth_api.get_current_user
app.get('/api/method/franchise_crm.franchise_crm.api.auth_api.get_current_user', async (req, res) => {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token.' })
  }

  const data = await readData()
  const email = data.sessions[token]
  if (!email) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  const user = data.users.find((item) => item.email === email)
  if (!user) {
    return res.status(401).json({ error: 'User not found.' })
  }

  return res.json({ message: 'ok', user: publicUser(user) })
})

app.get('/api/method/franchise_crm.api.auth_api.get_current_user', async (req, res) => {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token.' })
  }

  const data = await readData()
  const email = data.sessions[token]
  if (!email) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  const user = data.users.find((item) => item.email === email)
  if (!user) {
    return res.status(401).json({ error: 'User not found.' })
  }

  return res.json({ message: 'ok', user: publicUser(user) })
})

// Convenience short routes for local dev compatibility
app.post('/api/login', (req, res) => res.redirect(307, '/api/method/franchise_crm.api.auth_api.login'))
app.post('/api/signup', (req, res) => res.redirect(307, '/api/method/franchise_crm.api.auth_api.signup'))
app.post('/api/logout', (req, res) => res.redirect(307, '/api/method/franchise_crm.api.auth_api.logout'))
app.get('/api/me', (req, res) => res.redirect(307, '/api/method/franchise_crm.api.auth_api.get_current_user'))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

await ensureDataFile()

app.listen(port, () => {
  console.log(`Auth API server running on http://localhost:${port}`)
})

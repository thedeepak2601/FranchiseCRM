import express from 'express'
import fs from 'fs'
import multer from 'multer'
import vision from '@google-cloud/vision'

/**
 * @typedef {object} PanDetails
 * @property {string} holderName
 * @property {string} dateOfBirth
 * @property {string} panStatus
 * @property {string} category
 * @property {string} aadhaarSeedingStatus
 * @property {string} [note]
 */

/**
 * @typedef {object} GstDetails
 * @property {string} legalName
 * @property {string} tradeName
 * @property {string} gstStatus
 * @property {string} taxpayerType
 * @property {string} constitution
 * @property {string} registrationDate
 * @property {string} state
 * @property {string} city
 * @property {string} pincode
 * @property {string} address
 * @property {string} [note]
 */

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const port = Number(process.env.OCR_PORT || 3001)
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const gstCheckCodeChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** @type {Record<string, PanDetails>} */
const mockPanDetails = {
  ABCDE1234F: { holderName: 'Tinku', dateOfBirth: '1990-04-12', panStatus: 'Active', category: 'Individual', aadhaarSeedingStatus: 'Linked' },
  FGHIJ5678K: { holderName: 'Ram Naresh', dateOfBirth: '1988-09-18', panStatus: 'Active', category: 'Individual', aadhaarSeedingStatus: 'Linked' },
  PQRST6789L: { holderName: 'Priya Sharma', dateOfBirth: '1992-02-14', panStatus: 'Active', category: 'Individual', aadhaarSeedingStatus: 'Linked' },
  LMNOP4321Q: { holderName: 'Arjun Mehta', dateOfBirth: '1986-07-22', panStatus: 'Active', category: 'Individual', aadhaarSeedingStatus: 'Linked' },
  UVWXY9876A: { holderName: 'Kavya Iyer', dateOfBirth: '1991-11-05', panStatus: 'Active', category: 'Individual', aadhaarSeedingStatus: 'Linked' },
  KLMNO2468P: { holderName: 'Rohan Patel', dateOfBirth: '1985-05-30', panStatus: 'Active', category: 'Individual', aadhaarSeedingStatus: 'Linked' },
}

/** @type {Record<string, GstDetails>} */
const mockGstDetails = {
  '07ABCDE1234F1Z2': {
    legalName: 'Tinku Foods',
    tradeName: 'Tinku',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    constitution: 'Proprietorship',
    registrationDate: '2021-08-18',
    state: 'Delhi',
    city: 'New Delhi',
    pincode: '110001',
    address: 'Connaught Place, New Delhi',
  },
  '09FGHIJ5678K1ZZ': {
    legalName: 'Shubhamqw Naa Retail',
    tradeName: 'Shubhamqw Naa',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    constitution: 'Proprietorship',
    registrationDate: '2022-01-11',
    state: 'Uttar Pradesh',
    city: 'Noida',
    pincode: '201301',
    address: 'Sector 62, Noida',
  },
  '27PQRST6789L1ZU': {
    legalName: 'Urban Bites Private Limited',
    tradeName: 'Urban Bites',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    constitution: 'Private Limited Company',
    registrationDate: '2023-03-12',
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '400001',
    address: 'Fort, Mumbai',
  },
  '29LMNOP4321Q1Z0': {
    legalName: 'Nexa Retail LLP',
    tradeName: 'Nexa Retail',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    constitution: 'Limited Liability Partnership',
    registrationDate: '2022-09-09',
    state: 'Karnataka',
    city: 'Bengaluru',
    pincode: '560001',
    address: 'MG Road, Bengaluru',
  },
  '33UVWXY9876A1ZN': {
    legalName: 'Southline Distribution Co.',
    tradeName: 'Southline Distribution',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    constitution: 'Partnership',
    registrationDate: '2020-12-20',
    state: 'Tamil Nadu',
    city: 'Chennai',
    pincode: '600001',
    address: 'Parrys Corner, Chennai',
  },
  '24KLMNO2468P1Z7': {
    legalName: 'Westgate Supply Partners',
    tradeName: 'Westgate Supply',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    constitution: 'Partnership',
    registrationDate: '2021-06-24',
    state: 'Gujarat',
    city: 'Ahmedabad',
    pincode: '380001',
    address: 'Navrangpura, Ahmedabad',
  },
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

/**
 * @param {string} gstNumber
 * @returns {boolean}
 */
function isValidGstChecksum(gstNumber) {
  let factor = 2
  let sum = 0
  const checkCodePoint = gstCheckCodeChars.length
  const inputChars = gstNumber.slice(0, 14)

  for (let index = inputChars.length - 1; index >= 0; index -= 1) {
    const codePoint = gstCheckCodeChars.indexOf(inputChars[index])
    if (codePoint === -1) return false

    const digit = factor * codePoint
    factor = factor === 2 ? 1 : 2
    sum += Math.floor(digit / checkCodePoint) + (digit % checkCodePoint)
  }

  const checkCode = (checkCodePoint - (sum % checkCodePoint)) % checkCodePoint
  return gstNumber[14] === gstCheckCodeChars[checkCode]
}

/**
 * @param {string} gstNumber
 * @returns {boolean}
 */
function isValidGstNumber(gstNumber) {
  return gstPattern.test(gstNumber) && isValidGstChecksum(gstNumber)
}

/**
 * @param {string} _pan
 * @returns {PanDetails}
 */
function fallbackPanDetails(_pan) {
  return {
    holderName: 'Verified PAN Holder',
    dateOfBirth: 'Not available in mock verifier',
    panStatus: 'Active',
    category: 'Individual',
    aadhaarSeedingStatus: 'Not available in mock verifier',
    note: 'Replace this local endpoint with a licensed PAN provider for official data.',
  }
}

/**
 * @param {string} _gstNumber
 * @returns {GstDetails}
 */
function fallbackGstDetails(_gstNumber) {
  return {
    legalName: 'Verified GST Taxpayer',
    tradeName: 'Verified GST Taxpayer',
    gstStatus: 'Active',
    taxpayerType: 'Regular',
    constitution: 'Not available in mock verifier',
    registrationDate: 'Not available in mock verifier',
    state: 'Not available in mock verifier',
    city: 'Not available in mock verifier',
    pincode: 'Not available in mock verifier',
    address: 'Not available in mock verifier',
    note: 'Replace this local endpoint with a licensed GST provider for official data.',
  }
}

function getCredentialsPath() {
  return process.env.GOOGLE_APPLICATION_CREDENTIALS || ''
}

function getCredentialState() {
  const credentialsPath = getCredentialsPath()
  const credentialsPresent = credentialsPath ? fs.existsSync(credentialsPath) : false

  return {
    credentialsPath,
    credentialsPresent,
    visionReady: credentialsPresent,
  }
}

function createVisionClient() {
  const { credentialsPath, credentialsPresent } = getCredentialState()

  if (!credentialsPresent || !credentialsPath) {
    throw new Error(
      'Google Vision credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS to a valid credentials.json path.'
    )
  }

  return new vision.ImageAnnotatorClient({ keyFilename: credentialsPath })
}

app.get('/health', (_req, res) => {
  const state = getCredentialState()

  res.json({
    ok: state.visionReady,
    service: 'google-vision-ocr',
    visionReady: state.visionReady,
    credentialsConfigured: Boolean(state.credentialsPath),
    credentialsPresent: state.credentialsPresent,
    credentialsPath: state.credentialsPath || null,
    message: state.visionReady
      ? 'Google Vision OCR server is ready.'
      : 'Server is running, but GOOGLE_APPLICATION_CREDENTIALS is missing or points to a file that does not exist.',
  })
})

app.get('/verify-pan/:pan', (req, res) => {
  const pan = String(req.params.pan || '').toUpperCase()

  if (!panPattern.test(pan)) {
    return res.status(400).json({
      success: false,
      valid: false,
      pan,
      error: 'Invalid PAN format. PAN must be 10 characters: 5 letters, 4 digits, and 1 letter.',
    })
  }

  res.json({
    success: true,
    valid: true,
    verified: true,
    status: 'active',
    pan,
    source: 'local-development-verifier',
    ...(mockPanDetails[pan] || fallbackPanDetails(pan)),
  })
})

app.get('/verify-gst/:gst', (req, res) => {
  const gstNumber = String(req.params.gst || '').toUpperCase()

  if (!isValidGstNumber(gstNumber)) {
    return res.status(400).json({
      success: false,
      valid: false,
      gstNumber,
      error: 'Invalid GSTIN format or checksum.',
    })
  }

  res.json({
    success: true,
    valid: true,
    verified: true,
    status: 'active',
    gstNumber,
    pan: gstNumber.slice(2, 12),
    source: 'local-development-verifier',
    ...(mockGstDetails[gstNumber] || fallbackGstDetails(gstNumber)),
  })
})

app.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const client = createVisionClient()
    const [result] = await client.documentTextDetection({
      image: { content: req.file.buffer },
    })

    const text = result.fullTextAnnotation?.text || result.textAnnotations?.[0]?.description || ''
    const annotations = (result.textAnnotations || []).map((annotation) => ({
      description: annotation.description || '',
      boundingPoly: {
        vertices: (annotation.boundingPoly?.vertices || []).map((vertex) => ({
          x: vertex.x || 0,
          y: vertex.y || 0,
        })),
      },
    }))

    res.json({
      provider: 'google-vision',
      text,
      annotations,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OCR request failed'
    const status = message.includes('Google Vision credentials not configured') ? 503 : 500
    res.status(status).json({ error: message })
  }
})

app.listen(port, () => {
  const state = getCredentialState()
  console.log(`OCR server running on http://localhost:${port}`)
  if (!state.visionReady) {
    console.warn(
      'Google Vision is not ready. Set GOOGLE_APPLICATION_CREDENTIALS to a valid credentials.json path before using /ocr.'
    )
  }
})

import express from 'express'
import fs from 'fs'
import multer from 'multer'
import vision from '@google-cloud/vision'

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const port = Number(process.env.OCR_PORT || 3001)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

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

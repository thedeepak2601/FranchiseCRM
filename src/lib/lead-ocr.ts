export interface LeadOcrResult {
  capturedAt?: string
  name?: string
  phone?: string
  email?: string
  city?: string
  state?: string
  investmentRange?: string
  notes?: string
  approximateClosureDate?: string
  nextConnectMode?: string
  nextConnectAt?: string
  reference?: string
  rawText: string
  provider?: 'google-vision'
  fieldEvidence?: Partial<Record<OcrFieldKey, string>>
}

export type OcrFieldKey =
  | 'capturedAt'
  | 'name'
  | 'phone'
  | 'email'
  | 'city'
  | 'state'
  | 'investmentRange'
  | 'notes'
  | 'approximateClosureDate'
  | 'nextConnectMode'
  | 'nextConnectAt'
  | 'reference'

export interface OcrBackendHealth {
  ok: boolean
  service?: string
  visionReady?: boolean
  credentialsConfigured?: boolean
  credentialsPresent?: boolean
  credentialsPath?: string | null
  message?: string
}

interface VisionTextResult {
  rawText: string
  annotations: VisionAnnotation[]
}

interface VisionVertex {
  x: number
  y: number
}

interface VisionAnnotation {
  description: string
  boundingPoly?: {
    vertices?: VisionVertex[]
  }
}

const OCR_REQUEST_TIMEOUT_MS = 10000

const VILLPOWER_FIELD_REGIONS = {
  capturedAt: { x: 0.73, y: 0.10, width: 0.18, height: 0.08 },
  name: { x: 0.12, y: 0.10, width: 0.20, height: 0.10 },
  email: { x: 0.16, y: 0.24, width: 0.32, height: 0.09 },
  city: { x: 0.16, y: 0.31, width: 0.13, height: 0.07 },
  state: { x: 0.57, y: 0.31, width: 0.10, height: 0.07 },
  investmentRange: { x: 0.20, y: 0.38, width: 0.28, height: 0.08 },
  notes: { x: 0.16, y: 0.43, width: 0.53, height: 0.18 },
  approximateClosureDate: { x: 0.16, y: 0.64, width: 0.16, height: 0.09 },
  nextConnectAt: { x: 0.10, y: 0.72, width: 0.24, height: 0.10 },
  reference: { x: 0.08, y: 0.83, width: 0.20, height: 0.08 },
} as const

const VILLPOWER_PHONE_REGION = { x: 0.33, y: 0.18, width: 0.44, height: 0.09 } as const

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = OCR_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`OCR request timed out after ${Math.round(timeoutMs / 1000)} seconds.`)
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/[|]/g, 'I')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[â€œâ€]/g, '"')
    .replace(/[â€˜â€™]/g, "'")
    .trim()
}

function extractFirstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return ''
}

function extractFirstMatchWithEvidence(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) {
      return {
        value: match[1].trim(),
        evidence: match[0].trim(),
      }
    }
  }

  return {
    value: '',
    evidence: '',
  }
}

function cleanName(value: string) {
  return value
    .replace(/franchise details/ig, '')
    .replace(/villpower/ig, '')
    .replace(/india'?s first zero\s*-\s*risk franchise model!?/ig, '')
    .replace(/date/ig, '')
    .replace(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/g, '')
    .replace(/\bsaraswat\b.*$/i, 'Saraswat')
    .replace(/[^\p{L}\s.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanCityOrState(value: string) {
  return value
    .replace(/jaipin/ig, 'Jaipur')
    .replace(/tupus/ig, 'Jaipur')
    .replace(/investment range.*/i, '')
    .replace(/notes.*/i, '')
    .replace(/state.*/i, '')
    .replace(/city.*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeState(value: string) {
  const normalized = cleanCityOrState(value)
  if (!normalized) return ''
  if (/^raj\.?$/i.test(normalized) || /^raj/i.test(normalized)) return 'Rajasthan'
  return normalized
}

function cleanPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length > 10) return digits.slice(-10)
  return digits
}

function extractPhoneNearLabel(rawText: string) {
  const labelIndex = rawText.toLowerCase().indexOf('phone no')
  const scoped = labelIndex >= 0 ? rawText.slice(labelIndex, labelIndex + 180) : rawText
  const digitRuns = scoped.match(/\d{6,}/g) || rawText.match(/\d{6,}/g) || []
  const bestRun = digitRuns.sort((a, b) => b.length - a.length)[0] || ''
  return cleanPhone(bestRun)
}

function cleanReference(value: string) {
  return value
    .replace(/\b\d+\s*[\.\-]?\s*$/g, '')
    .replace(/\b1\s*2\s*3\s*4\s*5\s*6\s*7\s*8\s*9\s*10\b/g, '')
    .replace(/^reference[:\s-]*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanNotes(text: string) {
  return text
    .replace(/^notes[:\s-]*/i, '')
    .replace(/\bcall not richey\b/ig, 'Call not reachable')
    .replace(/\bcall not paley\b/ig, 'Call not picked')
    .replace(/\bcall not pice?d\b/ig, 'Call not picked')
    .replace(/\bcall not ticket\b/ig, 'Call not picked')
    .replace(/\bnot richel\b/ig, 'Not reachable')
    .replace(/\bcall not pay\b/ig, 'Call not picked')
    .replace(/\bcall not connected\b/ig, 'Call not connected')
    .replace(/\bcall not picked\b/ig, 'Call not picked')
    .replace(/\bno response\b/ig, 'No response')
    .replace(/\binsc\b/ig, 'INSC')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferNextConnectMode(text: string) {
  const lower = text.toLowerCase()
  if (lower.includes('whatsapp')) return 'WhatsApp'
  if (lower.includes('email')) return 'Email'
  if (lower.includes('meeting')) return 'Meeting'
  if (lower.includes('call')) return 'Call'
  return ''
}

function parseDateToInput(dateText: string, fallbackYear?: string) {
  const cleaned = dateText.replace(/[^\d/.-]/g, '')
  const match = cleaned.match(/(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/)
  if (!match) return ''
  const [, dd, mm, yy] = match
  const currentYear = String(new Date().getFullYear())
  const yearBase = yy ? (yy.length === 2 ? `20${yy}` : yy) : (fallbackYear || currentYear)
  return `${yearBase}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function parseDateTimeToInput(dateText: string, fallbackYear?: string) {
  const datePart = parseDateToInput(dateText, fallbackYear)
  if (!datePart) return ''
  const timeMatch = dateText.match(/(\d{1,2})[:.](\d{2})/)
  if (!timeMatch) return `${datePart}T09:00`
  const [, hh, mm] = timeMatch
  return `${datePart}T${hh.padStart(2, '0')}:${mm}`
}

function getDateCandidates(text: string) {
  return Array.from(text.matchAll(/\b\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?\b/g)).map((match) => match[0])
}

function extractSection(text: string, startLabel: string, endLabels: string[]) {
  const lower = text.toLowerCase()
  const start = lower.indexOf(startLabel.toLowerCase())
  if (start === -1) return ''
  const contentStart = start + startLabel.length
  let end = text.length
  for (const label of endLabels) {
    const idx = lower.indexOf(label.toLowerCase(), contentStart)
    if (idx !== -1 && idx < end) {
      end = idx
    }
  }
  return text.slice(contentStart, end).replace(/[:.]/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseWholePageFallback(rawText: string) {
  const dateMatch = extractFirstMatchWithEvidence(rawText, [
    /Date\s*[:.-]?\s*([0-9/.-]{4,10})/i,
  ])
  const nameMatch = extractFirstMatchWithEvidence(rawText, [
    /Name\s*[:.-]?\s*([A-Za-z][A-Za-z\s.]{2,})/i,
    /Franchise Details\s*Name\s*([A-Za-z][A-Za-z\s.]{2,})/i,
  ])
  const emailMatch = extractFirstMatchWithEvidence(rawText, [
    /Email\s*ID\s*[:.-]?\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
  ])
  const cityMatch = extractFirstMatchWithEvidence(rawText, [
    /City\s*[:.-]?\s*([A-Za-z\s]+?)(?:\s+State|$)/i,
  ])
  const stateMatch = extractFirstMatchWithEvidence(rawText, [
    /State\s*[:.-]?\s*([A-Za-z.\s]+?)(?:\s+Investment|\s+Notes|$)/i,
  ])
  const investmentRangeMatch = extractFirstMatchWithEvidence(rawText, [
    /Investment\s*range\s*[:.-]?\s*([A-Za-z0-9\s/-]+?)(?:\s+Notes|$)/i,
  ])
  const notesSection = extractSection(rawText, 'Notes', [
    'Approximate closure date',
    'Next Connect Mode/Time',
    'Reference',
  ])
  const closureSection = extractSection(rawText, 'Approximate closure date', [
    'Next Connect Mode/Time',
    'Reference',
  ])
  const nextConnectSection = extractSection(rawText, 'Next Connect Mode/Time', [
    'Reference',
  ])
  const referenceSection = extractSection(rawText, 'Reference', [])
  const dates = getDateCandidates(`${notesSection}\n${closureSection}\n${nextConnectSection}`)

  return {
    capturedAt: parseDateTimeToInput(dateMatch.value),
    name: cleanName(nameMatch.value),
    phone: extractPhoneNearLabel(rawText),
    email: emailMatch.value,
    city: cleanCityOrState(cityMatch.value),
    state: normalizeState(stateMatch.value),
    investmentRange: investmentRangeMatch.value,
    notes: cleanNotes(notesSection),
    approximateClosureDate: parseDateToInput(closureSection || dates[0] || ''),
    nextConnectMode: inferNextConnectMode(`${nextConnectSection}\n${notesSection}`) || '',
    nextConnectAt: parseDateTimeToInput(nextConnectSection || dates[1] || dates[0] || ''),
    reference: cleanReference(referenceSection),
    fieldEvidence: {
      capturedAt: dateMatch.evidence,
      name: nameMatch.evidence,
      email: emailMatch.evidence,
      city: cityMatch.evidence,
      state: stateMatch.evidence,
      investmentRange: investmentRangeMatch.evidence,
      notes: notesSection,
      approximateClosureDate: closureSection || dates[0] || '',
      nextConnectMode: nextConnectSection,
      nextConnectAt: nextConnectSection || dates[1] || dates[0] || '',
      reference: referenceSection,
      phone: rawText,
    } satisfies Partial<Record<OcrFieldKey, string>>,
  }
}

function preferValue(primary: string, fallback: string, minLength = 1) {
  return primary && primary.trim().length >= minLength ? primary : fallback
}

function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function getVertices(annotation: VisionAnnotation) {
  return annotation.boundingPoly?.vertices || []
}

function getBounds(annotation: VisionAnnotation) {
  const vertices = getVertices(annotation)
  const xs = vertices.map((vertex) => vertex.x)
  const ys = vertices.map((vertex) => vertex.y)
  return {
    left: xs.length ? Math.min(...xs) : 0,
    right: xs.length ? Math.max(...xs) : 0,
    top: ys.length ? Math.min(...ys) : 0,
    bottom: ys.length ? Math.max(...ys) : 0,
  }
}

function getCenter(annotation: VisionAnnotation) {
  const bounds = getBounds(annotation)
  return {
    x: (bounds.left + bounds.right) / 2,
    y: (bounds.top + bounds.bottom) / 2,
  }
}

function collectRegionText(
  annotations: VisionAnnotation[],
  area: { left: number; right: number; top: number; bottom: number }
) {
  return annotations
    .filter((annotation) => {
      const center = getCenter(annotation)
      return (
        center.x >= area.left &&
        center.x <= area.right &&
        center.y >= area.top &&
        center.y <= area.bottom
      )
    })
    .sort((a, b) => {
      const ay = getCenter(a).y
      const by = getCenter(b).y
      if (Math.abs(ay - by) > 14) return ay - by
      return getCenter(a).x - getCenter(b).x
    })
    .map((annotation) => annotation.description)
    .join(' ')
}

function findLabelAnnotation(annotations: VisionAnnotation[], labelVariants: string[]) {
  const normalizedVariants = labelVariants.map(normalizeLabel)
  return annotations.find((annotation) => normalizedVariants.includes(normalizeLabel(annotation.description)))
}

function parseCoordinateAwareFields(rawText: string, annotations: VisionAnnotation[]) {
  const wordAnnotations = annotations.slice(1)
  const imageBounds = wordAnnotations.reduce(
    (acc, annotation) => {
      const bounds = getBounds(annotation)
      return {
        right: Math.max(acc.right, bounds.right),
        bottom: Math.max(acc.bottom, bounds.bottom),
      }
    },
    { right: 0, bottom: 0 }
  )

  const fullPageFallback = parseWholePageFallback(rawText)
  const nameLabel = findLabelAnnotation(wordAnnotations, ['name'])
  const phoneLabel = findLabelAnnotation(wordAnnotations, ['phone no', 'phone'])
  const emailLabel = findLabelAnnotation(wordAnnotations, ['email id', 'email'])
  const cityLabel = findLabelAnnotation(wordAnnotations, ['city'])
  const stateLabel = findLabelAnnotation(wordAnnotations, ['state'])
  const notesLabel = findLabelAnnotation(wordAnnotations, ['notes'])
  const closureLabel = findLabelAnnotation(wordAnnotations, ['approximate closure date'])
  const nextConnectLabel = findLabelAnnotation(wordAnnotations, ['next connect mode time', 'next connect mode', 'next connect'])
  const referenceLabel = findLabelAnnotation(wordAnnotations, ['reference'])
  const dateLabel = findLabelAnnotation(wordAnnotations, ['date'])

  const rightEdge = imageBounds.right || 2000
  const bottomEdge = imageBounds.bottom || 3000

  const readRightOfLabel = (label: VisionAnnotation | undefined, width = 520, bandHeight = 90) => {
    if (!label) return ''
    const bounds = getBounds(label)
    return collectRegionText(wordAnnotations, {
      left: bounds.right + 8,
      right: Math.min(rightEdge, bounds.right + width),
      top: bounds.top - 16,
      bottom: bounds.bottom + bandHeight,
    })
  }

  const readBelowLabel = (label: VisionAnnotation | undefined, width = 620, height = 260) => {
    if (!label) return ''
    const bounds = getBounds(label)
    return collectRegionText(wordAnnotations, {
      left: Math.max(0, bounds.left - 12),
      right: Math.min(rightEdge, bounds.left + width),
      top: bounds.bottom + 6,
      bottom: Math.min(bottomEdge, bounds.bottom + height),
    })
  }

  const nameText = readRightOfLabel(nameLabel, 520, 45)
  const phoneText = readRightOfLabel(phoneLabel, 680, 45)
  const emailText = readRightOfLabel(emailLabel, 720, 45)
  const cityText = readRightOfLabel(cityLabel, 240, 40)
  const stateText = readRightOfLabel(stateLabel, 240, 40)
  const dateText = readRightOfLabel(dateLabel, 240, 30)
  const notesText = readBelowLabel(notesLabel, 900, 360)
  const closureText = readRightOfLabel(closureLabel, 260, 40)
  const nextConnectText = readRightOfLabel(nextConnectLabel, 340, 60)
  const referenceText = readRightOfLabel(referenceLabel, 320, 40)

  const dates = getDateCandidates(`${notesText}\n${closureText}\n${nextConnectText}\n${rawText}`)

  return {
    capturedAt: preferValue(parseDateTimeToInput(dateText), fullPageFallback.capturedAt || ''),
    name: preferValue(cleanName(nameText), fullPageFallback.name || '', 3),
    phone: preferValue(cleanPhone(phoneText), fullPageFallback.phone || '', 8),
    email: preferValue(cleanFieldText(emailText).replace(/\s+/g, ''), fullPageFallback.email || '', 5),
    city: preferValue(cleanCityOrState(cityText), fullPageFallback.city || '', 3),
    state: preferValue(normalizeState(stateText), fullPageFallback.state || '', 2),
    investmentRange: fullPageFallback.investmentRange || '',
    notes: preferValue(cleanNotes(notesText), fullPageFallback.notes || '', 8),
    approximateClosureDate: preferValue(parseDateToInput(closureText || dates[0] || ''), fullPageFallback.approximateClosureDate || ''),
    nextConnectMode: preferValue(inferNextConnectMode(nextConnectText || notesText), fullPageFallback.nextConnectMode || '') || 'Call',
    nextConnectAt: preferValue(parseDateTimeToInput(nextConnectText || dates[1] || dates[0] || ''), fullPageFallback.nextConnectAt || ''),
    reference: preferValue(cleanReference(referenceText), fullPageFallback.reference || '', 2),
    fieldEvidence: {
      capturedAt: dateText || fullPageFallback.fieldEvidence?.capturedAt || '',
      name: nameText || fullPageFallback.fieldEvidence?.name || '',
      phone: phoneText || fullPageFallback.fieldEvidence?.phone || '',
      email: emailText || fullPageFallback.fieldEvidence?.email || '',
      city: cityText || fullPageFallback.fieldEvidence?.city || '',
      state: stateText || fullPageFallback.fieldEvidence?.state || '',
      investmentRange: fullPageFallback.fieldEvidence?.investmentRange || '',
      notes: notesText || fullPageFallback.fieldEvidence?.notes || '',
      approximateClosureDate: closureText || fullPageFallback.fieldEvidence?.approximateClosureDate || '',
      nextConnectMode: nextConnectText || fullPageFallback.fieldEvidence?.nextConnectMode || '',
      nextConnectAt: nextConnectText || fullPageFallback.fieldEvidence?.nextConnectAt || '',
      reference: referenceText || fullPageFallback.fieldEvidence?.reference || '',
    } satisfies Partial<Record<OcrFieldKey, string>>,
  }
}

function looksLikeUsefulName(value: string) {
  return /^[A-Za-z][A-Za-z\s.]{2,}$/.test(value) && !/\b(call|reference|state|date)\b/i.test(value)
}

function looksLikeUsefulCity(value: string) {
  return /^[A-Za-z][A-Za-z\s.]{2,}$/.test(value)
}

function looksLikeUsefulState(value: string) {
  return /^[A-Za-z][A-Za-z\s.]{2,}$/.test(value)
}

function looksLikeUsefulEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function parseIdentityFields(identityText: string, phoneText: string) {
  const dateMatch = extractFirstMatchWithEvidence(identityText, [
    /Date\s*[:.-]?\s*([0-9/.-]{4,10})/i,
  ])
  const yearFromForm = dateMatch.value.match(/(\d{4})/)?.[1]
  const nameMatch = extractFirstMatchWithEvidence(identityText, [
    /Name\s*[:.-]?\s*([A-Za-z][A-Za-z\s.]{2,})/i,
    /Franchise Details\s*Name\s*([A-Za-z][A-Za-z\s.]{2,})/i,
  ])
  const emailMatch = extractFirstMatchWithEvidence(identityText, [
    /Email\s*ID\s*[:.-]?\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i,
  ])
  const cityMatch = extractFirstMatchWithEvidence(identityText, [
    /City\s*[:.-]?\s*([A-Za-z\s]+?)(?:\s+State|$)/i,
  ])
  const stateMatch = extractFirstMatchWithEvidence(identityText, [
    /State\s*[:.-]?\s*([A-Za-z.\s]+?)(?:\s+Investment|\s+Notes|$)/i,
  ])
  const investmentRangeMatch = extractFirstMatchWithEvidence(identityText, [
    /Investment\s*range\s*[:.-]?\s*([A-Za-z0-9\s/-]+?)(?:\s+Notes|$)/i,
  ])

  const phone = cleanPhone(phoneText)

  return {
    capturedAt: parseDateTimeToInput(dateMatch.value, yearFromForm),
    name: cleanName(nameMatch.value),
    phone,
    email: emailMatch.value,
    city: cleanCityOrState(cityMatch.value),
    state: normalizeState(stateMatch.value),
    investmentRange: investmentRangeMatch.value,
    fieldEvidence: {
      capturedAt: dateMatch.evidence,
      name: nameMatch.evidence,
      phone: phoneText,
      email: emailMatch.evidence,
      city: cityMatch.evidence,
      state: stateMatch.evidence,
      investmentRange: investmentRangeMatch.evidence,
    } satisfies Partial<Record<OcrFieldKey, string>>,
  }
}

function parseFollowUpFields(notesText: string, followUpText: string) {
  const combined = `${notesText}\n${followUpText}`
  const dates = getDateCandidates(combined)
  const explicitNextMode = extractFirstMatch(followUpText, [
    /(call|whatsapp|email|sms|meeting|video call)/i,
  ])
  const nextConnectMode = explicitNextMode || inferNextConnectMode(combined) || 'Call'
  const reference = cleanReference(extractFirstMatch(followUpText, [
    /Reference\s*[:.-]?\s*(.*)$/i,
  ]))

  return {
    notes: cleanNotes(notesText),
    approximateClosureDate: parseDateToInput(dates[0] || ''),
    nextConnectMode,
    nextConnectAt: parseDateTimeToInput(dates[1] || dates[0] || ''),
    reference,
    fieldEvidence: {
      notes: notesText,
      approximateClosureDate: dates[0] || '',
      nextConnectMode,
      nextConnectAt: dates[1] || dates[0] || '',
      reference,
    } satisfies Partial<Record<OcrFieldKey, string>>,
  }
}

function cleanFieldText(value: string) {
  return normalizeText(value)
    .replace(/^[:.\-\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function pickFirstMeaningfulLine(text: string) {
  const lines = normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(name|email id|city|state|date|investment range|notes|reference)$/i.test(line))

  return lines[0] || ''
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(arrayBuffer)
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file)

  try {
    return await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Unable to load uploaded image for OCR preprocessing.'))
      image.src = objectUrl
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function canvasToFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  if (!blob) {
    throw new Error('Unable to prepare OCR crop image.')
  }

  return new File([blob], fileName, { type: 'image/jpeg' })
}

function enhanceCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) return

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    const normalized = gray > 182 ? 255 : gray < 120 ? 0 : gray
    data[i] = normalized
    data[i + 1] = normalized
    data[i + 2] = normalized
  }

  context.putImageData(imageData, 0, 0)
}

async function normalizeVillPowerImage(file: File) {
  const image = await loadImage(file)
  const rotateClockwise = image.height > image.width
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create OCR preprocessing context.')
  }

  if (rotateClockwise) {
    canvas.width = image.height
    canvas.height = image.width
    context.translate(canvas.width, 0)
    context.rotate(Math.PI / 2)
  } else {
    canvas.width = image.width
    canvas.height = image.height
  }

  context.drawImage(image, 0, 0)
  enhanceCanvas(canvas)

  return {
    file: await canvasToFile(canvas, 'villpower-normalized.jpg'),
    width: canvas.width,
    height: canvas.height,
  }
}

async function cropImageRegion(
  file: File,
  imageWidth: number,
  imageHeight: number,
  region: { x: number; y: number; width: number; height: number },
  fileName: string
) {
  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create OCR crop context.')
  }

  const sx = Math.round(region.x * imageWidth)
  const sy = Math.round(region.y * imageHeight)
  const sw = Math.round(region.width * imageWidth)
  const sh = Math.round(region.height * imageHeight)

  canvas.width = sw
  canvas.height = sh
  context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh)
  enhanceCanvas(canvas)

  return canvasToFile(canvas, fileName)
}

async function runGoogleVisionRequest(file: File, apiKey: string, allowEmpty = false): Promise<VisionTextResult> {
  const base64Image = await fileToBase64(file)
  const response = await fetchWithTimeout(
    `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Google Vision request failed: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()
  const visionResponse = payload.responses?.[0]
  const rawText = normalizeText(
    visionResponse?.fullTextAnnotation?.text ||
    visionResponse?.textAnnotations?.[0]?.description ||
    ''
  )
  const annotations = (visionResponse?.textAnnotations || []).map((annotation: VisionAnnotation) => ({
    description: annotation.description || '',
    boundingPoly: {
      vertices: (annotation.boundingPoly?.vertices || []).map((vertex) => ({
        x: vertex.x || 0,
        y: vertex.y || 0,
      })),
    },
  }))

  if (!rawText && !allowEmpty) {
    throw new Error('Google Vision did not return readable text')
  }

  return { rawText, annotations }
}

async function runGoogleVisionBackendRequest(file: File, allowEmpty = false): Promise<VisionTextResult> {
  const endpoint = import.meta.env.VITE_OCR_API_URL || '/ocr'
  const formData = new FormData()
  formData.append('file', file)

  let response: Response
  try {
    response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      body: formData,
    })
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Google Vision server is not reachable. Start the local OCR server on http://localhost:3001.')
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || `Backend OCR request failed: ${response.status}`)
  }

  const payload = await response.json()
  const rawText = normalizeText(payload?.text || '')
  const annotations = (payload?.annotations || []).map((annotation: VisionAnnotation) => ({
    description: annotation.description || '',
    boundingPoly: {
      vertices: (annotation.boundingPoly?.vertices || []).map((vertex) => ({
        x: vertex.x || 0,
        y: vertex.y || 0,
      })),
    },
  }))

  if (!rawText && !allowEmpty) {
    throw new Error('Backend OCR did not return readable text')
  }

  return { rawText, annotations }
}

export async function getOcrBackendHealth(): Promise<OcrBackendHealth> {
  const endpoint = import.meta.env.VITE_OCR_API_URL || '/ocr'
  const healthUrl = endpoint.endsWith('/ocr') ? endpoint.replace(/\/ocr$/, '/health') : '/health'

  try {
    const response = await fetchWithTimeout(healthUrl, undefined, 5000)
    if (!response.ok) {
      return {
        ok: false,
        message: `Health check failed with status ${response.status}.`,
      }
    }

    return response.json()
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Google Vision server is not reachable.',
    }
  }
}

export async function extractLeadFieldsFromImage(file: File): Promise<LeadOcrResult> {
  const googleVisionApiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY
  const readText = googleVisionApiKey
    ? (cropFile: File, allowEmpty = false) => runGoogleVisionRequest(cropFile, googleVisionApiKey, allowEmpty)
    : (cropFile: File, allowEmpty = false) => runGoogleVisionBackendRequest(cropFile, allowEmpty)

  const normalized = await normalizeVillPowerImage(file)
  const fullPageResult = await readText(normalized.file, true)
  const coordinateFields = parseCoordinateAwareFields(fullPageResult.rawText, fullPageResult.annotations)

  const hasMeaningfulExtraction = Boolean(
    coordinateFields.name ||
    coordinateFields.phone ||
    coordinateFields.city ||
    coordinateFields.notes
  )

  if (!hasMeaningfulExtraction) {
    throw new Error('OCR could not confidently read this form. Try a clearer, closer, upright image.')
  }

  return {
    capturedAt: coordinateFields.capturedAt,
    name: coordinateFields.name,
    phone: coordinateFields.phone,
    email: coordinateFields.email,
    city: coordinateFields.city,
    state: coordinateFields.state,
    investmentRange: coordinateFields.investmentRange,
    notes: coordinateFields.notes,
    approximateClosureDate: coordinateFields.approximateClosureDate,
    nextConnectMode: coordinateFields.nextConnectMode,
    nextConnectAt: coordinateFields.nextConnectAt,
    reference: coordinateFields.reference,
    rawText: [
      'FULL_PAGE',
      fullPageResult.rawText,
    ].join('\n\n'),
    provider: 'google-vision',
    fieldEvidence: coordinateFields.fieldEvidence,
  }
}

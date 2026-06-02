import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronDown, Edit, Eye, FileText, Loader2, Plus, Save, Search, ShieldCheck, Trash2, Upload, Users, X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { useTheme } from '@/lib/theme-context'

type AccountType = 'Dealer' | 'Distributor' | 'Customer'
type CustomerStatus = 'active' | 'inactive'
type CustomerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

type CustomerDocument = {
  id: string
  type: string
  fileName: string
  uploadedAt: string
  fileUrl?: string
  fileType?: string
}

type Customer = {
  id: string
  companyName: string
  companyEmail: string
  companyPhone: string
  alternatePhone: string
  contactPersonName: string
  companyWebsite: string
  employees: string
  currency: string
  industry: string
  annualTurnover: string
  locations: string
  state: string
  city: string
  pincode: string
  billingAddress: string
  shippingAddress: string
  bankAccountNumber: string
  bankName: string
  ifscCode: string
  pan: string
  gstNumber: string
  country: string
  customerTier: CustomerTier
  customerSince: string
  accountType: AccountType
  status: CustomerStatus
  addedBy: string
  addedAt: string
  modifiedBy: string
  modifiedAt: string
  documents: CustomerDocument[]
}

const emptyCustomer: Omit<Customer, 'id' | 'addedBy' | 'addedAt' | 'modifiedBy' | 'modifiedAt' | 'documents'> = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  alternatePhone: '',
  contactPersonName: '',
  companyWebsite: '',
  employees: 'less than 50',
  currency: 'INR',
  industry: '',
  annualTurnover: '',
  locations: '',
  state: '',
  city: '',
  pincode: '',
  billingAddress: '',
  shippingAddress: '',
  bankAccountNumber: '',
  bankName: '',
  ifscCode: '',
  pan: '',
  gstNumber: '',
  country: 'India',
  customerTier: 'Bronze',
  customerSince: '',
  accountType: 'Customer',
  status: 'active',
}

const initialCustomers: Customer[] = [
  {
    id: 'CUS-001',
    ...emptyCustomer,
    companyName: 'Tinku',
    companyEmail: 'svk89@gmail.com',
    contactPersonName: 'Tinku',
    industry: 'Food & Beverage',
    state: 'Delhi',
    city: 'New Delhi',
    pincode: '110001',
    billingAddress: 'Connaught Place, New Delhi',
    shippingAddress: 'Connaught Place, New Delhi',
    pan: 'ABCDE1234F',
    gstNumber: '07ABCDE1234F1Z2',
    accountType: 'Dealer',
    customerTier: 'Silver',
    addedBy: 'Sonam',
    addedAt: '2026-04-22T12:17:03.000Z',
    modifiedBy: '',
    modifiedAt: '',
    documents: [],
  },
  {
    id: 'CUS-002',
    ...emptyCustomer,
    companyName: 'Shubhamqw Naa',
    companyEmail: 'ramnaresh2323@proeffico.com',
    contactPersonName: 'Ram Naresh',
    industry: 'Retail',
    state: 'Uttar Pradesh',
    city: 'Noida',
    pincode: '201301',
    billingAddress: 'Sector 62, Noida',
    shippingAddress: 'Sector 62, Noida',
    pan: 'FGHIJ5678K',
    gstNumber: '09FGHIJ5678K1ZZ',
    accountType: 'Dealer',
    customerTier: 'Bronze',
    addedBy: 'Sonam',
    addedAt: '2026-04-21T23:29:19.000Z',
    modifiedBy: 'Ram Naresh',
    modifiedAt: '2026-05-23T12:09:31.000Z',
    documents: [
      { id: 'DOC-001', type: 'GST', fileName: 'gst-certificate.pdf', uploadedAt: '2026-05-23T12:09:31.000Z' },
    ],
  },
  {
    id: 'CUS-003',
    ...emptyCustomer,
    companyName: 'Urban Bites Private Limited',
    companyEmail: 'accounts@urbanbites.example',
    companyPhone: '+91 98765 43210',
    contactPersonName: 'Priya Sharma',
    industry: 'Food & Beverage',
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '400001',
    billingAddress: 'Fort, Mumbai',
    shippingAddress: 'Fort, Mumbai',
    pan: 'PQRST6789L',
    gstNumber: '27PQRST6789L1ZU',
    accountType: 'Customer',
    customerTier: 'Gold',
    customerSince: '2026-02-15',
    addedBy: 'Admin',
    addedAt: '2026-05-01T10:30:00.000Z',
    modifiedBy: '',
    modifiedAt: '',
    documents: [],
  },
  {
    id: 'CUS-004',
    ...emptyCustomer,
    companyName: 'Nexa Retail LLP',
    companyEmail: 'contact@nexaretail.example',
    companyPhone: '+91 99887 76655',
    contactPersonName: 'Arjun Mehta',
    industry: 'Retail',
    state: 'Karnataka',
    city: 'Bengaluru',
    pincode: '560001',
    billingAddress: 'MG Road, Bengaluru',
    shippingAddress: 'MG Road, Bengaluru',
    pan: 'LMNOP4321Q',
    gstNumber: '29LMNOP4321Q1Z0',
    accountType: 'Customer',
    customerTier: 'Silver',
    customerSince: '2026-03-20',
    addedBy: 'Admin',
    addedAt: '2026-05-02T11:15:00.000Z',
    modifiedBy: '',
    modifiedAt: '',
    documents: [],
  },
  {
    id: 'CUS-005',
    ...emptyCustomer,
    companyName: 'Southline Distribution Co.',
    companyEmail: 'ops@southline.example',
    companyPhone: '+91 91234 56780',
    contactPersonName: 'Kavya Iyer',
    industry: 'Services',
    state: 'Tamil Nadu',
    city: 'Chennai',
    pincode: '600001',
    billingAddress: 'Parrys Corner, Chennai',
    shippingAddress: 'Parrys Corner, Chennai',
    pan: 'UVWXY9876A',
    gstNumber: '33UVWXY9876A1ZN',
    accountType: 'Distributor',
    customerTier: 'Platinum',
    customerSince: '2026-01-10',
    addedBy: 'Admin',
    addedAt: '2026-05-03T09:45:00.000Z',
    modifiedBy: '',
    modifiedAt: '',
    documents: [],
  },
  {
    id: 'CUS-006',
    ...emptyCustomer,
    companyName: 'Westgate Supply Partners',
    companyEmail: 'sales@westgate.example',
    companyPhone: '+91 90123 45678',
    contactPersonName: 'Rohan Patel',
    industry: 'Manufacturing',
    state: 'Gujarat',
    city: 'Ahmedabad',
    pincode: '380001',
    billingAddress: 'Navrangpura, Ahmedabad',
    shippingAddress: 'Navrangpura, Ahmedabad',
    pan: 'KLMNO2468P',
    gstNumber: '24KLMNO2468P1Z7',
    accountType: 'Distributor',
    customerTier: 'Gold',
    customerSince: '2026-04-05',
    addedBy: 'Admin',
    addedAt: '2026-05-04T14:20:00.000Z',
    modifiedBy: '',
    modifiedAt: '',
    documents: [],
  },
]

const employeeOptions = ['less than 50', '50 - 100', '101 - 250', '251 - 500', 'more than 500']
const currencyOptions = ['INR', 'USD', 'EUR', 'GBP']
const industryOptions = ['Food & Beverage', 'Retail', 'Education', 'Healthcare', 'Services', 'Manufacturing']
const tierOptions: CustomerTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum']
const accountTypeOptions: AccountType[] = ['Dealer', 'Distributor', 'Customer']
const documentTypes = ['Quatation', 'Aadhar Card', 'Payment Proof', 'GST', 'PAN', 'Proposals', 'Voter ID']
const pageSize = 12
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const gstCheckCodeChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

type VerificationStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'unavailable'
type VerificationState = {
  status: VerificationStatus
  message: string
  value: string
  details?: Record<string, unknown>
}

const emptyVerification: VerificationState = {
  status: 'idle',
  message: '',
  value: '',
}

const sanitizeTaxId = (value: string, maxLength: number) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLength)

const isValidPan = (value: string) => panPattern.test(value)

const isValidGstChecksum = (gstNumber: string) => {
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

const isValidGstNumber = (value: string) => gstPattern.test(value) && isValidGstChecksum(value)

const isVerifiedForValue = (verification: VerificationState, value: string) =>
  verification.status === 'valid' && verification.value === value

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null

const parseVerificationResponse = (data: unknown) => {
  const response = toRecord(data)
  if (!response) return { verified: false, details: {} }

  const status = String(response.status ?? response.statusCode ?? response.gstStatus ?? '').toLowerCase()
  const valid = response.valid ?? response.isValid ?? response.success ?? response.verified

  const verified =
    valid === true ||
    (typeof valid === 'string' && ['true', 'valid', 'active', 'success', 'verified'].includes(valid.toLowerCase())) ||
    ['valid', 'active', 'success', 'verified'].includes(status)

  return { verified, details: response }
}

const verifyTaxIdWithApi = async (type: 'pan' | 'gst', value: string) => {
  const template = type === 'pan' ? import.meta.env.VITE_PAN_VERIFY_URL : import.meta.env.VITE_GST_VERIFY_URL
  if (!template) return null

  const endpoint = String(template).replace('{value}', encodeURIComponent(value)).replace(type === 'pan' ? '{pan}' : '{gst}', encodeURIComponent(value))
  const response = await fetch(endpoint)
  if (!response.ok) return { verified: false, details: { status: response.status, statusText: response.statusText } }

  return parseVerificationResponse(await response.json())
}

const findResponseValue = (data: unknown, keys: string[]): string => {
  if (typeof data !== 'object' || data === null) return ''
  const normalizedKeys = keys.map((key) => key.toLowerCase())
  const entries = Object.entries(data as Record<string, unknown>)

  for (const [key, value] of entries) {
    if (normalizedKeys.includes(key.toLowerCase()) && (typeof value === 'string' || typeof value === 'number')) {
      return String(value)
    }
  }

  for (const [, value] of entries) {
    if (typeof value === 'object' && value !== null) {
      const nestedValue = findResponseValue(value, keys)
      if (nestedValue) return nestedValue
    }
  }

  return ''
}

const extractGstPrefill = (gstNumber: string, details?: Record<string, unknown>) => ({
  pan: gstNumber.slice(2, 12),
  companyName: findResponseValue(details, ['legalName', 'legal_name', 'lgnm', 'businessName', 'business_name', 'taxpayerName', 'name']),
  contactPersonName: findResponseValue(details, ['tradeName', 'trade_name', 'tradeNam', 'contactPersonName']),
  state: findResponseValue(details, ['state', 'stateName', 'stj', 'pradrState']),
  city: findResponseValue(details, ['city', 'district', 'dst', 'location']),
  pincode: findResponseValue(details, ['pincode', 'pinCode', 'pin', 'zip']),
  billingAddress: findResponseValue(details, ['address', 'fullAddress', 'addr', 'adr', 'principalAddress']),
})

const extractPanDetails = (pan: string, details?: Record<string, unknown>) => compactObject({
  pan,
  holderName: findResponseValue(details, ['holderName', 'fullName', 'name', 'panName', 'registeredName']),
  firstName: findResponseValue(details, ['firstName', 'first_name', 'fname']),
  middleName: findResponseValue(details, ['middleName', 'middle_name', 'mname']),
  lastName: findResponseValue(details, ['lastName', 'last_name', 'lname']),
  dateOfBirth: findResponseValue(details, ['dateOfBirth', 'dob', 'birthDate']),
  panStatus: findResponseValue(details, ['panStatus', 'status', 'pan_status']),
  category: findResponseValue(details, ['category', 'panCategory', 'type']),
  aadhaarSeedingStatus: findResponseValue(details, ['aadhaarSeedingStatus', 'aadhaarLinked', 'aadhaar_linked']),
})

const extractGstDetails = (gstNumber: string, details?: Record<string, unknown>) => compactObject({
  gstNumber,
  pan: gstNumber.slice(2, 12),
  legalName: findResponseValue(details, ['legalName', 'legal_name', 'lgnm', 'taxpayerName']),
  tradeName: findResponseValue(details, ['tradeName', 'trade_name', 'tradeNam']),
  gstStatus: findResponseValue(details, ['gstStatus', 'status', 'sts']),
  taxpayerType: findResponseValue(details, ['taxpayerType', 'dty', 'registrationType']),
  constitution: findResponseValue(details, ['constitution', 'ctb', 'businessConstitution']),
  registrationDate: findResponseValue(details, ['registrationDate', 'rgdt', 'dateOfRegistration']),
  cancellationDate: findResponseValue(details, ['cancellationDate', 'cxdt']),
  state: findResponseValue(details, ['state', 'stateName', 'stj', 'pradrState']),
  city: findResponseValue(details, ['city', 'district', 'dst', 'location']),
  pincode: findResponseValue(details, ['pincode', 'pinCode', 'pin', 'zip']),
  address: findResponseValue(details, ['address', 'fullAddress', 'addr', 'adr', 'principalAddress']),
})

const compactObject = (value: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== '' && item !== undefined && item !== null))

const formatStatusLabel = (status: 'all' | CustomerStatus) =>
  status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)

const formatDateTime = (value: string) => {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(value))
}

export default function CustomerMaster() {
  const { palette } = useTheme()
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all')
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | AccountType>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [draft, setDraft] = useState(emptyCustomer)
  const [draftDocuments, setDraftDocuments] = useState<CustomerDocument[]>([])
  const [error, setError] = useState('')
  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [documentType, setDocumentType] = useState('')
  const [documentFileName, setDocumentFileName] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [viewingDocument, setViewingDocument] = useState<CustomerDocument | null>(null)
  const [panVerification, setPanVerification] = useState<VerificationState>(emptyVerification)
  const [gstVerification, setGstVerification] = useState<VerificationState>(emptyVerification)
  const [viewingVerification, setViewingVerification] = useState<'gst' | 'pan' | null>(null)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return customers.filter((customer) => {
      const matchesSearch =
        !term ||
        [customer.companyName, customer.companyPhone, customer.companyEmail, customer.contactPersonName, customer.city, customer.state].some((value) =>
          value.toLowerCase().includes(term)
        )
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      const matchesType = accountTypeFilter === 'all' || customer.accountType === accountTypeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [accountTypeFilter, customers, searchTerm, statusFilter])

  const counts = {
    all: customers.length,
    active: customers.filter((customer) => customer.status === 'active').length,
    inactive: customers.filter((customer) => customer.status === 'inactive').length,
  }
  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [accountTypeFilter, searchTerm, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setDraft(emptyCustomer)
    setDraftDocuments([])
    setError('')
    setPanVerification(emptyVerification)
    setGstVerification(emptyVerification)
    setFormOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setEditing(customer)
    const { id, addedBy, addedAt, modifiedBy, modifiedAt, documents, ...editableCustomer } = customer
    void id
    void addedBy
    void addedAt
    void modifiedBy
    void modifiedAt
    setDraft(editableCustomer)
    setDraftDocuments(documents)
    setError('')
    setPanVerification(emptyVerification)
    setGstVerification(emptyVerification)
    setFormOpen(true)
  }

  const closeForm = () => {
    setEditing(null)
    setDraft(emptyCustomer)
    setDraftDocuments([])
    setError('')
    setPanVerification(emptyVerification)
    setGstVerification(emptyVerification)
    setFormOpen(false)
  }

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const updatePan = (value: string) => {
    updateDraft('pan', sanitizeTaxId(value, 10))
    setPanVerification(emptyVerification)
  }

  const updateGstNumber = (value: string) => {
    updateDraft('gstNumber', sanitizeTaxId(value, 15))
    setGstVerification(emptyVerification)
  }

  const verifyPan = async () => {
    const pan = draft.pan.trim()
    if (!isValidPan(pan)) {
      setPanVerification({ status: 'invalid', message: 'Enter a valid PAN: 5 letters, 4 digits, then 1 letter. Example: ABCDE1234F.', value: pan })
      return
    }

    setPanVerification({ status: 'checking', message: 'Verifying PAN...', value: pan })
    try {
      const verified = await verifyTaxIdWithApi('pan', pan)
      if (verified === null) {
        setPanVerification({
          status: 'unavailable',
          message: 'PAN format is valid, but live PAN details cannot be fetched until VITE_PAN_VERIFY_URL is configured.',
          value: pan,
          details: { pan, requiredApi: 'VITE_PAN_VERIFY_URL', expectedUrlTemplate: 'https://provider.example/verify-pan/{pan}' },
        })
        return
      }
      const panDetails = extractPanDetails(pan, verified.details)
      setPanVerification({
        status: verified.verified ? 'valid' : 'invalid',
        message: verified.verified ? 'PAN verified. Person details were fetched from the API.' : 'PAN was not verified by the API. Please check the number or provider response.',
        value: pan,
        details: compactObject({ ...panDetails, rawApiResponse: verified.details }),
      })
    } catch {
      setPanVerification({ status: 'unavailable', message: 'PAN API is unavailable. Format validation passed.', value: pan })
    }
  }

  const verifyGstNumber = async () => {
    const gstNumber = draft.gstNumber.trim()
    if (!isValidGstNumber(gstNumber)) {
      setGstVerification({ status: 'invalid', message: 'Enter a valid 15-character GSTIN with state code, PAN, entity code, Z, and checksum.', value: gstNumber })
      return
    }

    setGstVerification({ status: 'checking', message: 'Verifying GSTIN...', value: gstNumber })
    try {
      const verified = await verifyTaxIdWithApi('gst', gstNumber)
      if (verified === null) {
        const details = { gstNumber, pan: gstNumber.slice(2, 12), requiredApi: 'VITE_GST_VERIFY_URL', expectedUrlTemplate: 'https://provider.example/verify-gst/{gst}' }
        updateDraft('pan', gstNumber.slice(2, 12))
        setPanVerification(emptyVerification)
        setGstVerification({
          status: 'unavailable',
          message: 'GSTIN format is valid and PAN was filled from GSTIN, but live GST details cannot be fetched until VITE_GST_VERIFY_URL is configured.',
          value: gstNumber,
          details,
        })
        return
      }
      const prefill = extractGstPrefill(gstNumber, verified.details)
      const gstDetails = extractGstDetails(gstNumber, verified.details)
      if (verified.verified) {
        setDraft((current) => ({
          ...current,
          pan: prefill.pan || current.pan,
          companyName: prefill.companyName || current.companyName,
          contactPersonName: prefill.contactPersonName || current.contactPersonName,
          state: prefill.state || current.state,
          city: prefill.city || current.city,
          pincode: prefill.pincode || current.pincode,
          billingAddress: prefill.billingAddress || current.billingAddress,
          shippingAddress: current.shippingAddress || prefill.billingAddress,
        }))
        if (prefill.pan && prefill.pan !== draft.pan) {
          setPanVerification(emptyVerification)
        }
      }
      setGstVerification({
        status: verified.verified ? 'valid' : 'invalid',
        message: verified.verified ? 'GSTIN verified. Business details were fetched and available fields were filled.' : 'GSTIN was not verified by the API. Please check the number or provider response.',
        value: gstNumber,
        details: compactObject({ ...gstDetails, rawApiResponse: verified.details }),
      })
    } catch {
      setGstVerification({ status: 'unavailable', message: 'GSTIN API is unavailable. Format and checksum validation passed.', value: gstNumber })
    }
  }

  const copyBillingToShipping = (checked: boolean) => {
    if (checked) {
      updateDraft('shippingAddress', draft.billingAddress)
    }
  }

  const saveCustomer = () => {
    if (!draft.companyName.trim() || !draft.companyEmail.trim() || !draft.companyPhone.trim() || !draft.contactPersonName.trim()) {
      setError('Company name, email, phone, and contact person are required.')
      return
    }

    if (!draft.industry || !draft.state.trim() || !draft.city.trim() || !draft.pincode.trim() || !draft.billingAddress.trim()) {
      setError('Industry, state, city, pincode, and billing address are required.')
      return
    }

    if (!draft.pan.trim() || !draft.gstNumber.trim()) {
      setError('PAN and GST Number are required.')
      return
    }

    if (!isValidPan(draft.pan.trim())) {
      setError('Enter a valid PAN before submitting. Use 5 letters, 4 digits, then 1 letter. Example: ABCDE1234F.')
      return
    }

    if (!isValidGstNumber(draft.gstNumber.trim())) {
      setError('Enter a valid GST Number before submitting. It must be 15 characters and pass GSTIN checksum validation.')
      return
    }

    const unverifiedFields = [
      !isVerifiedForValue(panVerification, draft.pan.trim()) ? 'PAN' : '',
      !isVerifiedForValue(gstVerification, draft.gstNumber.trim()) ? 'GST Number' : '',
    ].filter(Boolean)

    if (unverifiedFields.length > 0) {
      setError(`Please verify first: ${unverifiedFields.join(', ')}.`)
      return
    }

    const now = new Date().toISOString()
    if (editing) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editing.id
            ? {
                ...customer,
                ...draft,
                documents: draftDocuments,
                modifiedBy: draft.contactPersonName || 'Admin',
                modifiedAt: now,
              }
            : customer
        )
      )
    } else {
      const nextId = `CUS-${String(customers.length + 1).padStart(3, '0')}`
      setCustomers((current) => [
        {
          id: nextId,
          ...draft,
          addedBy: 'Admin',
          addedAt: now,
          modifiedBy: '',
          modifiedAt: '',
          documents: draftDocuments,
        },
        ...current,
      ])
    }

    closeForm()
  }

  const addDocument = () => {
    if (!documentType || !documentFileName.trim() || !documentFile) return
    const nextDocument: CustomerDocument = {
      id: `DOC-${String(draftDocuments.length + 1).padStart(3, '0')}`,
      type: documentType,
      fileName: documentFileName.trim(),
      uploadedAt: new Date().toISOString(),
      fileUrl: URL.createObjectURL(documentFile),
      fileType: documentFile.type,
    }
    setDraftDocuments((current) => [...current, nextDocument])
    setDocumentType('')
    setDocumentFileName('')
    setDocumentFile(null)
    setDocumentModalOpen(false)
  }

  const removeDocument = (documentId: string) => {
    setDraftDocuments((current) => {
      const documentToRemove = current.find((document) => document.id === documentId)
      if (documentToRemove?.fileUrl) {
        URL.revokeObjectURL(documentToRemove.fileUrl)
      }
      return current.filter((document) => document.id !== documentId)
    })
    setViewingDocument((current) => (current?.id === documentId ? null : current))
  }

  const handleDocumentFileChange = (file: File | null) => {
    setDocumentFile(file)
    setDocumentFileName(file?.name ?? '')
  }

  const closeDocumentModal = () => {
    setDocumentModalOpen(false)
    setDocumentType('')
    setDocumentFileName('')
    setDocumentFile(null)
  }

  const deleteCustomer = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId)
    if (!customer || !window.confirm(`Delete ${customer.companyName}?`)) return
    setCustomers((current) => current.filter((item) => item.id !== customerId))
  }

  const toggleCustomerStatus = (customerId: string) => {
    const now = new Date().toISOString()
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: customer.status === 'active' ? 'inactive' : 'active',
              modifiedBy: 'Admin',
              modifiedAt: now,
            }
          : customer
      )
    )
  }

  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: string[],
    required = false,
    placeholder = 'Select'
  ) => (
    <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>
      {label} {required ? <span style={{ color: palette.rose }}>*</span> : null}
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-md border px-3 pr-9 text-sm outline-none"
          style={{ background: palette.bgElev, borderColor: palette.border, color: value ? palette.text : palette.textMute }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option === 'active' || option === 'inactive' ? formatStatusLabel(option) : option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
      </div>
    </label>
  )

  const renderVerificationStatus = (state: VerificationState) => {
    if (state.status === 'idle') return null

    const color =
      state.status === 'valid' ? palette.emerald :
      state.status === 'invalid' ? palette.rose :
      state.status === 'unavailable' ? palette.amber :
      palette.textMute
    const StatusIcon = state.status === 'valid' ? CheckCircle2 : state.status === 'checking' ? Loader2 : AlertCircle

    return (
      <span className="flex min-h-5 items-center gap-1 text-xs" style={{ color }}>
        <StatusIcon className={`h-3.5 w-3.5 ${state.status === 'checking' ? 'animate-spin' : ''}`} />
        {state.message}
      </span>
    )
  }

  const renderVerificationButton = (
    type: 'gst' | 'pan',
    verification: VerificationState,
    valueLength: number,
    expectedLength: number,
    onVerify: () => void
  ) => {
    const canViewDetails = Boolean(verification.details) && verification.value === (type === 'gst' ? draft.gstNumber.trim() : draft.pan.trim()) && verification.status !== 'checking'

    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => {
          if (canViewDetails) {
            setViewingVerification(type)
            return
          }
          onVerify()
        }}
        disabled={verification.status === 'checking' || (!canViewDetails && valueLength !== expectedLength)}
        aria-label={canViewDetails ? `View ${type.toUpperCase()} verification details` : `Verify ${type.toUpperCase()}`}
        title={canViewDetails ? 'View verification details' : 'Verify'}
        style={{ borderColor: palette.violet, color: palette.violet }}
      >
        {verification.status === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : canViewDetails ? <Eye className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </Button>
    )
  }

  const renderTaxVerificationFields = () => (
    <>
      <div className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>
        <label htmlFor="customer-gst">GST Number <span style={{ color: palette.rose }}>*</span></label>
        <div className="flex gap-2">
          <Input
            id="customer-gst"
            placeholder="Enter Tax Identification Number"
            value={draft.gstNumber}
            maxLength={15}
            inputMode="text"
            pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]"
            onChange={(event) => updateGstNumber(event.target.value)}
            onBlur={() => {
              if (draft.gstNumber && draft.gstNumber.length < 15) {
                setGstVerification({ status: 'invalid', message: 'GST Number must be exactly 15 characters. Please complete the GSTIN before verifying.', value: draft.gstNumber })
              }
            }}
            style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
          />
          {renderVerificationButton('gst', gstVerification, draft.gstNumber.length, 15, verifyGstNumber)}
        </div>
        {renderVerificationStatus(gstVerification)}
      </div>
      <div className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>
        <label htmlFor="customer-pan">PAN <span style={{ color: palette.rose }}>*</span></label>
        <div className="flex gap-2">
          <Input
            id="customer-pan"
            placeholder="Enter PAN"
            value={draft.pan}
            maxLength={10}
            inputMode="text"
            pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]"
            onChange={(event) => updatePan(event.target.value)}
            onBlur={() => {
              if (draft.pan && draft.pan.length < 10) {
                setPanVerification({ status: 'invalid', message: 'PAN must be exactly 10 characters. Please complete the PAN before verifying.', value: draft.pan })
              }
            }}
            style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
          />
          {renderVerificationButton('pan', panVerification, draft.pan.length, 10, verifyPan)}
        </div>
        {renderVerificationStatus(panVerification)}
      </div>
    </>
  )

  const activeVerification = viewingVerification === 'gst' ? gstVerification : viewingVerification === 'pan' ? panVerification : null
  const activeVerificationTitle = viewingVerification === 'gst' ? 'GST Verification Details' : 'PAN Verification Details'
  const activeVerificationDetails = activeVerification?.details ?? {}
  const activeVerificationSummary = Object.entries(activeVerificationDetails).filter(([key]) => key !== 'rawApiResponse')
  const activeRawApiResponse = activeVerificationDetails.rawApiResponse ?? activeVerificationDetails
  const activeVerificationColor =
    activeVerification?.status === 'valid' ? palette.emerald :
    activeVerification?.status === 'invalid' ? palette.rose :
    activeVerification?.status === 'unavailable' ? palette.amber :
    palette.textMute

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <PageHeaderTitle title="Customer Master" />
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Manage customers, dealers, company information, bank details, and documents.
          </p>
        </div>
        <Button style={{ background: palette.violet }} onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {!formOpen ? (
        <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
          <CardContent className="p-4">
            <div className="flex w-full flex-nowrap items-center gap-3">
              <div className="flex shrink-0 items-center gap-2">
                {(['all', 'active', 'inactive'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border px-4 text-sm transition-colors"
                    style={{
                      background: statusFilter === filter ? palette.violet : palette.bgElev,
                      color: statusFilter === filter ? 'white' : palette.text,
                      borderColor: statusFilter === filter ? palette.violet : palette.border,
                    }}
                  >
                    {formatStatusLabel(filter)}
                    <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: statusFilter === filter ? 'rgba(255,255,255,0.18)' : palette.bg }}>
                      {counts[filter]}
                    </span>
                  </button>
                ))}
                </div>
                <div className="relative w-[240px] shrink-0">
                  <select
                    value={accountTypeFilter}
                    onChange={(event) => setAccountTypeFilter(event.target.value as 'all' | AccountType)}
                    className="h-11 w-full appearance-none rounded-md border px-3 pr-9 text-sm outline-none"
                    style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
                  >
                    <option value="all">All Account Types</option>
                    {accountTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
                </div>
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search Name, Phone, Email"
                    className="h-11 pl-10"
                    style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="flex shrink-0 items-center">
                  <ViewToggle value={viewMode} onChange={setViewMode} />
                </div>
              </div>

            {viewMode === 'grid' ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedCustomers.map((customer) => (
                  <Card key={customer.id} style={{ background: palette.bgElev, borderColor: palette.border }}>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium" style={{ color: palette.text }}>{customer.companyName}</div>
                          <div className="mt-1 text-xs" style={{ color: palette.textMute }}>{customer.companyEmail}</div>
                        </div>
                        <Badge style={{ background: palette.violetBg, color: palette.violet }}>{customer.accountType}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs" style={{ color: palette.textMute }}>Phone</div>
                          <div style={{ color: palette.textDim }}>{customer.companyPhone || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: palette.textMute }}>Status</div>
                          <div style={{ color: customer.status === 'active' ? palette.emerald : palette.rose }}>{formatStatusLabel(customer.status)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: palette.border }}>
                        <span className="text-xs" style={{ color: palette.textMute }}>{customer.id}</span>
                        <div className="flex gap-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(customer)} aria-label={`View ${customer.companyName}`} title="View">
                            <Eye className="h-4 w-4" style={{ color: palette.violet }} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(customer)} aria-label={`Edit ${customer.companyName}`} title="Edit">
                            <Edit className="h-4 w-4" style={{ color: palette.amber }} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => deleteCustomer(customer.id)} aria-label={`Delete ${customer.companyName}`} title="Delete">
                            <Trash2 className="h-4 w-4" style={{ color: palette.rose }} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredCustomers.length === 0 ? (
                  <div className="rounded-lg border px-4 py-10 text-center text-sm md:col-span-2 xl:col-span-3" style={{ borderColor: palette.border, color: palette.textMute }}>No customer found.</div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: palette.border }}>
              <div className="grid grid-cols-[160px_minmax(220px,1fr)_160px_160px_260px_220px_220px] border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ background: palette.bgElev, borderColor: palette.border, color: palette.textMute }}>
                <div>Actions</div>
                <div>Company Name</div>
                <div>Account Type</div>
                <div>Phone</div>
                <div>Email</div>
                <div>Added By</div>
                <div>Modified By</div>
              </div>
              {paginatedCustomers.map((customer) => (
                <div key={customer.id} className="grid grid-cols-[160px_minmax(220px,1fr)_160px_160px_260px_220px_220px] items-center border-b px-4 py-3 last:border-b-0" style={{ borderColor: palette.border }}>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(customer)} aria-label={`View ${customer.companyName}`} title="View">
                      <Eye className="h-4 w-4" style={{ color: palette.violet }} />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(customer)} aria-label={`Edit ${customer.companyName}`} title="Edit">
                      <Edit className="h-4 w-4" style={{ color: palette.amber }} />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => deleteCustomer(customer.id)} aria-label={`Delete ${customer.companyName}`} title="Delete">
                      <Trash2 className="h-4 w-4" style={{ color: palette.rose }} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleCustomerStatus(customer.id)}
                      aria-label={`${formatStatusLabel(customer.status)}: click to mark ${formatStatusLabel(customer.status === 'active' ? 'inactive' : 'active')}`}
                      title={`${formatStatusLabel(customer.status)} - click to mark ${formatStatusLabel(customer.status === 'active' ? 'inactive' : 'active')}`}
                    >
                      {customer.status === 'active' ? (
                        <CheckCircle2 className="h-4 w-4" style={{ color: palette.emerald }} />
                      ) : (
                        <XCircle className="h-4 w-4" style={{ color: palette.rose }} />
                      )}
                    </Button>
                  </div>
                  <div className="truncate text-sm font-medium" style={{ color: palette.text }}>{customer.companyName}</div>
                  <div><Badge style={{ background: palette.violetBg, color: palette.violet }}>{customer.accountType}</Badge></div>
                  <div className="text-sm" style={{ color: palette.textDim }}>{customer.companyPhone || 'N/A'}</div>
                  <div className="truncate text-sm" style={{ color: palette.textDim }}>{customer.companyEmail}</div>
                  <div className="text-sm" style={{ color: palette.textDim }}>
                    <div>{customer.addedBy}</div>
                    <div className="text-xs" style={{ color: palette.textMute }}>{formatDateTime(customer.addedAt)}</div>
                  </div>
                  <div className="text-sm" style={{ color: palette.textDim }}>
                    <div>{customer.modifiedBy || 'N/A'}</div>
                    <div className="text-xs" style={{ color: palette.textMute }}>{formatDateTime(customer.modifiedAt)}</div>
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm" style={{ color: palette.textMute }}>No customer found.</div>
              ) : null}
            </div>
            )}
            <div className="mt-4">
              <Pagination page={page} pageSize={pageSize} totalItems={filteredCustomers.length} onPageChange={setPage} itemLabel="customers" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: palette.violet }} />
              <h2 className="text-lg font-semibold" style={{ color: palette.text }}>{editing ? 'Edit Customer' : 'Add Customer'}</h2>
            </div>
            <Button type="button" variant="outline" onClick={closeForm} style={{ borderColor: palette.border, color: palette.text }}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
          {error ? (
            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardHeader className="border-b py-3" style={{ borderColor: palette.violetBorder, background: palette.bgElev }}>
              <CardTitle className="text-base" style={{ color: palette.violet }}>Tax Verification</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
              {renderTaxVerificationFields()}
            </CardContent>
          </Card>

          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardHeader className="border-b py-3" style={{ borderColor: palette.violetBorder, background: palette.bgElev }}>
              <CardTitle className="text-base" style={{ color: palette.violet }}>Company Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Company Name <span style={{ color: palette.rose }}>*</span><Input placeholder="Enter Company Name" value={draft.companyName} onChange={(event) => updateDraft('companyName', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Company Email <span style={{ color: palette.rose }}>*</span><Input type="email" placeholder="Enter Company Email" value={draft.companyEmail} onChange={(event) => updateDraft('companyEmail', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Company Phone <span style={{ color: palette.rose }}>*</span><Input placeholder="+91" value={draft.companyPhone} onChange={(event) => updateDraft('companyPhone', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Alternate Phone<Input placeholder="+91" value={draft.alternatePhone} onChange={(event) => updateDraft('alternatePhone', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Contact Person Name <span style={{ color: palette.rose }}>*</span><Input placeholder="Enter Contact Person Name" value={draft.contactPersonName} onChange={(event) => updateDraft('contactPersonName', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Company Website<Input placeholder="Enter Company Website URL" value={draft.companyWebsite} onChange={(event) => updateDraft('companyWebsite', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              {renderSelect('No. of Employees', draft.employees, (value) => updateDraft('employees', value), employeeOptions)}
              {renderSelect('Currency', draft.currency, (value) => updateDraft('currency', value), currencyOptions)}
              {renderSelect('Industry', draft.industry, (value) => updateDraft('industry', value), industryOptions, true, 'Select Industry')}
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Annual Turnover<Input placeholder="Enter Turnover" value={draft.annualTurnover} onChange={(event) => updateDraft('annualTurnover', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>No. of Locations<Input placeholder="Enter No. of Locations" value={draft.locations} onChange={(event) => updateDraft('locations', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>State <span style={{ color: palette.rose }}>*</span><Input placeholder="Enter State" value={draft.state} onChange={(event) => updateDraft('state', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>City <span style={{ color: palette.rose }}>*</span><Input placeholder="Enter City" value={draft.city} onChange={(event) => updateDraft('city', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Pincode <span style={{ color: palette.rose }}>*</span><Input placeholder="Enter Pincode/ZIP" value={draft.pincode} onChange={(event) => updateDraft('pincode', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium lg:row-span-2" style={{ color: palette.text }}>Billing Address <span style={{ color: palette.rose }}>*</span><Textarea placeholder="Enter Billing Address" value={draft.billingAddress} onChange={(event) => updateDraft('billingAddress', event.target.value)} className="min-h-32" style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium lg:col-span-1" style={{ color: palette.text }}>
                <div className="flex items-center justify-between gap-2">
                  <span>Shipping Address</span>
                  <span className="flex items-center gap-2 text-xs" style={{ color: palette.textDim }}>
                    Same as billing address
                    <input type="checkbox" onChange={(event) => copyBillingToShipping(event.target.checked)} style={{ accentColor: palette.violet }} />
                  </span>
                </div>
                <Textarea placeholder="Enter Shipping Address" value={draft.shippingAddress} onChange={(event) => updateDraft('shippingAddress', event.target.value)} className="min-h-32" style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              </label>
            </CardContent>
          </Card>

          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardHeader className="border-b py-3" style={{ borderColor: palette.violetBorder, background: palette.bgElev }}>
              <CardTitle className="text-base" style={{ color: palette.violet }}>Bank Account Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Bank Account Number<Input placeholder="Enter Bank Account Number" value={draft.bankAccountNumber} onChange={(event) => updateDraft('bankAccountNumber', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Bank Name<Input placeholder="Enter Bank Name" value={draft.bankName} onChange={(event) => updateDraft('bankName', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>IFSC Code<Input placeholder="Enter IFSC Code" value={draft.ifscCode} onChange={(event) => updateDraft('ifscCode', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
            </CardContent>
          </Card>

          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardContent className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
              {renderSelect('Country', draft.country, (value) => updateDraft('country', value), ['India'], true)}
              {renderSelect('Customer Tier', draft.customerTier, (value) => updateDraft('customerTier', value), tierOptions, true)}
              <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>Customer Since<Input type="date" value={draft.customerSince} onChange={(event) => updateDraft('customerSince', event.target.value)} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} /></label>
              {renderSelect('Account Type', draft.accountType, (value) => updateDraft('accountType', value), accountTypeOptions, true)}
              {renderSelect('Status', draft.status, (value) => updateDraft('status', value), ['active', 'inactive'], true)}
            </CardContent>
          </Card>

          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardHeader className="border-b py-3" style={{ borderColor: palette.violetBorder, background: palette.bgElev }}>
              <CardTitle className="text-base" style={{ color: palette.violet }}>Upload Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-hidden rounded-lg border" style={{ borderColor: palette.border }}>
                <div className="grid grid-cols-[90px_minmax(180px,1fr)_minmax(180px,1fr)_120px] px-4 py-3 text-sm font-semibold" style={{ background: palette.bgElev, color: palette.text }}>
                  <div>S.No.</div>
                  <div>Document Name</div>
                  <div>File</div>
                  <div className="text-right">Action</div>
                </div>
                {draftDocuments.map((document, index) => (
                  <div key={document.id} className="grid grid-cols-[90px_minmax(180px,1fr)_minmax(180px,1fr)_120px] items-center border-t px-4 py-3 text-sm" style={{ borderColor: palette.border, color: palette.textDim }}>
                    <div>{index + 1}</div>
                    <div>{document.type}</div>
                    <div className="truncate">{document.fileName}</div>
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => setViewingDocument(document)} aria-label={`View ${document.type}`}>
                        <Eye className="h-4 w-4" style={{ color: palette.violet }} />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeDocument(document.id)} aria-label={`Remove ${document.type}`}>
                        <Trash2 className="h-4 w-4" style={{ color: palette.rose }} />
                      </Button>
                    </div>
                  </div>
                ))}
                {draftDocuments.length === 0 ? (
                  <div className="border-t px-4 py-4 text-sm" style={{ borderColor: palette.border, color: palette.textDim }}>No Document Available</div>
                ) : null}
              </div>
              <Button type="button" variant="outline" className="mt-4" onClick={() => setDocumentModalOpen(true)} style={{ borderColor: palette.violet, color: palette.violet }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="button" onClick={saveCustomer} style={{ background: palette.violet }}>
              <Save className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </div>
      )}

      {viewingVerification && activeVerification ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewingVerification(null)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="flex items-center justify-between border-b p-4" style={{ borderColor: palette.border }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: palette.text }}>{activeVerificationTitle}</h2>
                <p className="text-sm" style={{ color: palette.textMute }}>{activeVerification.value}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setViewingVerification(null)} aria-label="Close verification details">
                <X className="h-5 w-5" style={{ color: palette.textDim }} />
              </Button>
            </div>
            <div className="overflow-auto p-4">
              <div className="mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm" style={{ borderColor: activeVerificationColor, color: activeVerificationColor }}>
                {activeVerification.status === 'valid' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                {activeVerification.message}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeVerificationSummary.map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3" style={{ borderColor: palette.border, background: palette.bgElev }}>
                    <div className="text-xs font-semibold uppercase" style={{ color: palette.textMute }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="mt-1 break-words text-sm" style={{ color: palette.text }}>
                      {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
              {activeVerificationSummary.length === 0 ? (
                <div className="rounded-lg border p-4 text-sm" style={{ borderColor: palette.border, color: palette.textDim }}>No verification details available.</div>
              ) : null}
              <div className="mt-5 text-sm font-semibold" style={{ color: palette.text }}>Raw API Response</div>
              <pre className="mt-4 max-h-56 overflow-auto rounded-lg border p-3 text-xs" style={{ borderColor: palette.border, background: palette.bgElev, color: palette.textDim }}>
                {JSON.stringify(activeRawApiResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}

      {documentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeDocumentModal}>
          <div className="w-full max-w-xl rounded-xl border p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="mb-5 flex items-center justify-between border-b pb-4" style={{ borderColor: palette.border }}>
              <h2 className="text-xl font-semibold" style={{ color: palette.text }}>Upload Document</h2>
              <Button type="button" variant="ghost" size="icon" onClick={closeDocumentModal}>
                <X className="h-5 w-5" style={{ color: palette.textDim }} />
              </Button>
            </div>
            <label className="space-y-2 text-sm font-medium" style={{ color: palette.text }}>
              Document Type<span style={{ color: palette.rose }}>*</span>
              <div className="relative">
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  className="h-12 w-full appearance-none rounded-md border px-3 pr-9 text-sm outline-none"
                  style={{ background: palette.bgElev, borderColor: palette.border, color: documentType ? palette.text : palette.textMute }}
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
              </div>
            </label>
            <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center" style={{ borderColor: palette.border, color: palette.textMute }}>
              <input
                type="file"
                className="hidden"
                onChange={(event) => handleDocumentFileChange(event.target.files?.[0] ?? null)}
              />
              <Upload className="mb-2 h-7 w-7" style={{ color: palette.violet }} />
              <span className="text-base font-medium" style={{ color: palette.textDim }}>{documentFileName || 'Click to upload or drag & drop'}</span>
              <span className="text-sm">all file types up to 5MB</span>
            </label>
            <Button type="button" className="mt-5 w-full" onClick={addDocument} disabled={!documentType || !documentFile} style={{ background: palette.violet }}>
              <FileText className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      ) : null}

      {viewingDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setViewingDocument(null)}>
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="flex items-center justify-between border-b p-4" style={{ borderColor: palette.border }}>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold" style={{ color: palette.text }}>{viewingDocument.type}</h2>
                <p className="truncate text-sm" style={{ color: palette.textMute }}>{viewingDocument.fileName}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setViewingDocument(null)} aria-label="Close document preview">
                <X className="h-5 w-5" style={{ color: palette.textDim }} />
              </Button>
            </div>
            <div className="flex min-h-[420px] flex-1 items-center justify-center overflow-auto p-4">
              {viewingDocument.fileUrl && viewingDocument.fileType?.startsWith('image/') ? (
                <img src={viewingDocument.fileUrl} alt={viewingDocument.fileName} className="max-h-[70vh] max-w-full rounded-lg object-contain" />
              ) : viewingDocument.fileUrl && viewingDocument.fileType === 'application/pdf' ? (
                <iframe src={viewingDocument.fileUrl} title={viewingDocument.fileName} className="h-[70vh] w-full rounded-lg border" style={{ borderColor: palette.border }} />
              ) : viewingDocument.fileUrl ? (
                <div className="text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10" style={{ color: palette.violet }} />
                  <p className="text-sm" style={{ color: palette.textDim }}>Preview is not available for this file type.</p>
                  <a href={viewingDocument.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: palette.violet }}>
                    Open file
                  </a>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10" style={{ color: palette.textMute }} />
                  <p className="text-sm" style={{ color: palette.textDim }}>This document only has a file name, so there is no uploaded file to preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

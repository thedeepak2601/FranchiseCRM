/**
 * Integration Service Layer
 * Handles external integrations: WhatsApp, Payments, IRP, E-stamp
 */

import { frappeClient } from './frappe-client'

// ============================================================
// TYPES
// ============================================================

export interface WhatsAppMessage {
  to: string
  template: string
  parameters?: Record<string, string>
}

export interface PaymentRequest {
  amount: number
  currency: string
  customer: string
  description: string
  callbackUrl?: string
}

export interface IRNRequest {
  docType: string
  docNo: string
  seller: {
    gstin: string
    legalName: string
    address: string
  }
  buyer: {
    gstin: string
    legalName: string
    address: string
  }
  items: Array<{
    description: string
    hsnCode: string
    quantity: number
    rate: number
    taxRate: number
  }>
}

export interface EStampRequest {
  documentType: string
  documentNo: string
  parties: Array<{
    name: string
    address: string
    gstin?: string
  }>
  stampValue: number
}

// ============================================================
// WHATSAPP INTEGRATION (Interakt/WATI/Gupshup)
// ============================================================

class WhatsAppService {
  private provider: 'interakt' | 'wati' | 'gupshup' = 'interakt'
  private apiEndpoint: string

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_WHATSAPP_API || ''
  }

  async sendMessage(message: WhatsAppMessage): Promise<{ messageId: string }> {
    // In production, this would call the actual WhatsApp API
    return frappeClient.rpc('franchise_crm.integrations.send_whatsapp', {
      provider: this.provider,
      ...message,
    })
  }

  async sendTemplateMessage(to: string, templateName: string, params?: string[]): Promise<void> {
    await this.sendMessage({
      to,
      template: templateName,
      parameters: params?.reduce((acc, val, idx) => ({ ...acc, [`param${idx + 1}`]: val }), {}),
    })
  }

  async getMessageStatus(messageId: string): Promise<{ status: string; timestamp: string }> {
    return frappeClient.rpc('franchise_crm.integrations.get_whatsapp_status', { messageId })
  }
}

// ============================================================
// PAYMENT INTEGRATION (Razorpay/Cashfree)
// ============================================================

class PaymentService {
  private provider: 'razorpay' | 'cashfree' = 'razorpay'
  private keyId: string

  constructor() {
    this.keyId = import.meta.env.VITE_RAZORPAY_KEY || ''
  }

  async createPaymentLink(request: PaymentRequest): Promise<{ paymentLink: string; id: string }> {
    if (this.provider === 'razorpay') {
      return this.createRazorpayLink(request)
    }
    return this.createCashfreeLink(request)
  }

  private async createRazorpayLink(request: PaymentRequest): Promise<{ paymentLink: string; id: string }> {
    return frappeClient.rpc('franchise_crm.integrations.create_razorpay_link', request)
  }

  private async createCashfreeLink(request: PaymentRequest): Promise<{ paymentLink: string; id: string }> {
    return frappeClient.rpc('franchise_crm.integrations.create_cashfree_link', request)
  }

  async verifyPayment(paymentId: string): Promise<{ verified: boolean; amount: number }> {
    return frappeClient.rpc('franchise_crm.integrations.verify_payment', { paymentId })
  }

  async processRefund(paymentId: string, amount: number, reason: string): Promise<{ refundId: string }> {
    return frappeClient.rpc('franchise_crm.integrations.process_refund', {
      paymentId,
      amount,
      reason,
    })
  }
}

// ============================================================
// IRP INTEGRATION (Invoice Registration Portal)
// ============================================================

class IRPService {
  private baseUrl: string
  private username: string
  private password: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_IRP_URL || 'https://einvoice.erpnext.com'
    this.username = import.meta.env.VITE_IRP_USER || ''
    this.password = import.meta.env.VITE_IRP_PASS || ''
  }

  async generateIRN(request: IRNRequest): Promise<{ irn: string; signedJson: string; qrCode: string }> {
    return frappeClient.rpc('franchise_crm.integrations.generate_irn', request)
  }

  async cancelIRN(irn: string, reason: string): Promise<{ cancelDate: string }> {
    return frappeClient.rpc('franchise_crm.integrations.cancel_irn', { irn, reason })
  }

  async getIRNStatus(irn: string): Promise<{ status: string; ackNo: string; ackDate: string }> {
    return frappeClient.rpc('franchise_crm.integrations.get_irn_status', { irn })
  }
}

// ============================================================
// E-STAMP INTEGRATION (SignDesk)
// ============================================================

class EStampService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_ESTAMP_URL || 'https://api.signdesk.in'
    this.apiKey = import.meta.env.VITE_ESTAMP_KEY || ''
  }

  async createEStamp(request: EStampRequest): Promise<{ stampId: string; stampUrl: string }> {
    return frappeClient.rpc('franchise_crm.integrations.create_estamp', request)
  }

  async getStampStatus(stampId: string): Promise<{ status: string; documentUrl: string }> {
    return frappeClient.rpc('franchise_crm.integrations.get_estamp_status', { stampId })
  }

  async cancelStamp(stampId: string, reason: string): Promise<{ cancelDate: string }> {
    return frappeClient.rpc('franchise_crm.integrations.cancel_estamp', { stampId, reason })
  }
}

// ============================================================
// EXPORT SERVICES
// ============================================================

export const whatsappService = new WhatsAppService()
export const paymentService = new PaymentService()
export const irpService = new IRPService()
export const eStampService = new EStampService()

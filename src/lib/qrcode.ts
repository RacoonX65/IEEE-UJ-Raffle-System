import QRCode from 'qrcode'
import crypto from 'crypto'

export interface QRCodeData {
  ticketNumber: string
  buyerName: string
  buyerEmail: string
  sellerName: string
  timestamp: string
  eventId?: string
  signature: string
}

export interface VerificationResult {
  isValid: boolean
  ticket?: QRCodeData
  error?: string
}

class QRCodeService {
  private secret: string
  private baseUrl: string

  constructor() {
    this.secret = process.env.TICKET_VERIFICATION_SECRET || 'default-secret-change-in-production'
    this.baseUrl = process.env.QR_CODE_BASE_URL || 'http://localhost:3000/verify'
  }

  /**
   * Generate a signature for ticket data
   */
  private generateSignature(data: Omit<QRCodeData, 'signature'>): string {
    const payload = `${data.ticketNumber}|${data.buyerName}|${data.buyerEmail}|${data.sellerName}|${data.timestamp}|${data.eventId || ''}`
    return crypto.createHmac('sha256', this.secret).update(payload).digest('hex')
  }

  /**
   * Verify a ticket signature
   */
  private verifySignature(data: QRCodeData): boolean {
    const expectedSignature = this.generateSignature({
      ticketNumber: data.ticketNumber,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      sellerName: data.sellerName,
      timestamp: data.timestamp,
      eventId: data.eventId
    })
    return expectedSignature === data.signature
  }

  /**
   * Generate QR code data URL for a ticket
   */
  async generateQRCode(ticketData: {
    ticketNumber: string
    buyerName: string
    buyerEmail: string
    sellerName: string
    timestamp: string
    eventId?: string
  }): Promise<string> {
    try {
      // Create signed ticket data
      const qrData: QRCodeData = {
        ...ticketData,
        signature: this.generateSignature(ticketData)
      }

      // Create verification URL with encoded data
      const encodedData = Buffer.from(JSON.stringify(qrData)).toString('base64')
      const verificationUrl = `${this.baseUrl}/${encodedData}`

      console.log('Generating QR code for URL:', verificationUrl)

      // Generate QR code as data URL with simpler options
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 200
      })

      console.log('QR code generated successfully')
      return qrCodeDataUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate QR code as SVG string for embedding in documents
   */
  async generateQRCodeSVG(ticketData: {
    ticketNumber: string
    buyerName: string
    buyerEmail: string
    sellerName: string
    timestamp: string
    eventId?: string
  }): Promise<string> {
    try {
      const qrData: QRCodeData = {
        ...ticketData,
        signature: this.generateSignature(ticketData)
      }

      const encodedData = Buffer.from(JSON.stringify(qrData)).toString('base64')
      const verificationUrl = `${this.baseUrl}/${encodedData}`

      const qrCodeSVG = await QRCode.toString(verificationUrl, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#6366f1',
          light: '#FFFFFF'
        },
        width: 200
      })

      return qrCodeSVG
    } catch (error) {
      console.error('Error generating QR code SVG:', error)
      throw new Error('Failed to generate QR code SVG')
    }
  }

  /**
   * Verify a ticket from QR code data
   */
  verifyTicket(encodedData: string): VerificationResult {
    try {
      // Decode the data
      const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8')
      const ticketData: QRCodeData = JSON.parse(decodedData)

      // Verify the signature
      if (!this.verifySignature(ticketData)) {
        return {
          isValid: false,
          error: 'Invalid ticket signature - ticket may be forged'
        }
      }

      // Check if ticket is not too old (optional - 30 days validity)
      const ticketDate = new Date(ticketData.timestamp)
      const now = new Date()
      const daysDifference = (now.getTime() - ticketDate.getTime()) / (1000 * 3600 * 24)
      
      if (daysDifference > 30) {
        return {
          isValid: false,
          error: 'Ticket has expired (older than 30 days)'
        }
      }

      return {
        isValid: true,
        ticket: ticketData
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      return {
        isValid: false,
        error: 'Invalid QR code data format'
      }
    }
  }

  /**
   * Generate verification URL for a ticket
   */
  generateVerificationUrl(ticketData: {
    ticketNumber: string
    buyerName: string
    buyerEmail: string
    sellerName: string
    timestamp: string
    eventId?: string
  }): string {
    const qrData: QRCodeData = {
      ...ticketData,
      signature: this.generateSignature(ticketData)
    }

    const encodedData = Buffer.from(JSON.stringify(qrData)).toString('base64')
    return `${this.baseUrl}/${encodedData}`
  }
}

export const qrCodeService = new QRCodeService()

import { google } from 'googleapis'

export interface TicketEntry {
  timestamp: string
  name: string // Changed from fullName to match dashboard
  email: string
  whatsapp: string // Changed from whatsappNumber to match dashboard
  paymentMethod: string // Made more flexible
  seller: string // Changed from sellerName to match dashboard
  consentToEmail?: boolean
  ticketNumber: string // Made required
}

export interface TicketStats {
  totalTickets: number
  totalAmount: number
  ticketsBySeller: Record<string, number>
  recentEntries: TicketEntry[]
}

class GoogleSheetsService {
  private sheets: any
  private spreadsheetId: string

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!
  }

  async getTicketData(): Promise<TicketStats> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:I', // Extended range to include payment verification columns (H and I)
      })

      const rows = response.data.values || []
      const headers = rows[0] || []
      const dataRows = rows.slice(1)

      const entries: TicketEntry[] = dataRows.map((row: any[], index: number) => ({
        timestamp: row[0] || '', // Column A: Timestamp
        name: row[1] || '', // Column B: Name
        email: row[2] || '', // Column C: Email
        whatsapp: row[3] || '', // Column D: WhatsApp
        paymentMethod: row[4] || 'Cash', // Column E: Payment Method
        seller: row[5] || '', // Column F: Seller
        ticketNumber: row[6] || `IEEE-UJ-${String(index + 1).padStart(4, '0')}`, // Column G: Tracker Number
        paymentStatus: row[7] || (row[4] === 'Cash' ? 'VERIFIED' : 'PENDING'), // Column H: Payment Status
        verificationNotes: row[8] || '', // Column I: Verification Notes
        consentToEmail: true, // Default to true since not in your sheet
      }))

      // Calculate statistics
      const totalTickets = entries.length
      const ticketPrice = 50 // Adjust based on your ticket price
      const totalAmount = totalTickets * ticketPrice

      const ticketsBySeller: Record<string, number> = {}
      entries.forEach(entry => {
        if (entry.seller) {
          ticketsBySeller[entry.seller] = (ticketsBySeller[entry.seller] || 0) + 1
        }
      })

      return {
        totalTickets,
        totalAmount,
        ticketsBySeller,
        recentEntries: entries.slice(-10).reverse(), // Last 10 entries, most recent first
      }
    } catch (error) {
      console.error('Error fetching sheet data:', error)
      throw error
    }
  }

  async exportToCsv(): Promise<string> {
    try {
      const stats = await this.getTicketData()
      const headers = ['Timestamp', 'Full Name', 'Email', 'WhatsApp', 'Payment Method', 'Seller', 'Email Consent', 'Ticket Number']
      
      let csv = headers.join(',') + '\n'
      
      stats.recentEntries.reverse().forEach(entry => {
        const row = [
          entry.timestamp,
          `"${entry.name}"`,
          entry.email,
          entry.whatsapp,
          entry.paymentMethod,
          entry.seller,
          entry.consentToEmail ? 'Yes' : 'No',
          entry.ticketNumber
        ]
        csv += row.join(',') + '\n'
      })

      return csv
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      throw error
    }
  }
}

export const sheetsService = new GoogleSheetsService()

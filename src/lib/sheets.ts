import { google } from 'googleapis'

export interface TicketEntry {
  timestamp: string
  name: string // Changed from fullName to match dashboard
  email: string
  paymentMethod: string // Made more flexible
  seller: string // Changed from sellerName to match dashboard
  consentToEmail?: boolean
  ticketNumber: string // Made required
  paymentStatus?: string
  verificationNotes?: string
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  attended?: boolean // Track if attendee showed up at event
  attendedAt?: string // Timestamp when attendee checked in
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
        range: 'A:H', // Updated range to match new structure without WhatsApp
      })

      const rows = response.data.values || []
      const headers = rows[0] || []
      const dataRows = rows.slice(1)

      // Debug logging to see what we're getting from Google Sheets
      console.log('Google Sheets Debug:')
      console.log('Total rows:', rows.length)
      console.log('Headers:', headers)
      console.log('Data rows:', dataRows.length)
      console.log('First few data rows:', dataRows.slice(0, 3))

      const entries: TicketEntry[] = dataRows.map((row: any[], index: number) => {
        // Check if ticket has been verified (payment status is VERIFIED)
        const isVerified = row[6] === 'VERIFIED'
        
        // Check if attendee has checked in at the event (column I)
        const hasAttended = row[8] === 'ATTENDED'
        
        return {
          timestamp: row[0] || '', // Column A: Timestamp
          name: row[1] || '', // Column B: Name
          email: row[2] || '', // Column C: Email
          paymentMethod: row[3] || 'Cash', // Column D: Payment Method
          seller: row[4] || '', // Column E: Seller
          ticketNumber: row[5] || `IEEE-UJ-${String(index + 1).padStart(4, '0')}`, // Column F: Ticket Number
          paymentStatus: row[6] || (row[3] === 'Cash' ? 'VERIFIED' : 'PENDING'), // Column G: Payment Status
          verificationNotes: row[7] || '', // Column H: Verification Notes
          attended: hasAttended, // Column I: Attendance Status
          attendedAt: hasAttended ? row[9] || undefined : undefined, // Column J: Attendance Timestamp
          consentToEmail: true, // Default to true since not in your sheet
          verified: isVerified, // Consider verified if payment status is VERIFIED
          verifiedAt: isVerified ? row[0] : undefined, // Use timestamp as verification date if verified
          verifiedBy: isVerified ? 'System' : undefined // Default verification agent
        }
      })

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
      const headers = ['Timestamp', 'Full Name', 'Email', 'Payment Method', 'Seller', 'Email Consent', 'Ticket Number']
      
      let csv = headers.join(',') + '\n'
      
      stats.recentEntries.reverse().forEach(entry => {
        const row = [
          entry.timestamp,
          `"${entry.name}"`,
          entry.email,
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

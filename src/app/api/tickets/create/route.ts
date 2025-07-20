import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, whatsapp, paymentMethod, seller, ticketPrice } = body

    // Validate required fields
    if (!name || !email || !whatsapp || !paymentMethod || !seller) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!

    // Get current data to determine next ticket number
    const currentDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:G',
    })

    const rows = currentDataResponse.data.values || []
    const dataRows = rows.slice(1) // Skip header row
    const nextTicketNumber = `TICKET-${String(dataRows.length + 1).padStart(3, '0')}`

    // Create timestamp
    const timestamp = new Date().toLocaleString('en-ZA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Johannesburg'
    })

    // Prepare row data to match your Google Sheet structure
    // A: Timestamp, B: Name, C: Email, D: WhatsApp, E: Payment Method, F: Seller, G: Tracker Number
    const newRow = [
      timestamp,           // A: Timestamp
      name,               // B: Name
      email,              // C: Email
      whatsapp,           // D: WhatsApp
      paymentMethod,      // E: Payment Method
      seller,             // F: Seller
      nextTicketNumber    // G: Tracker Number
    ]

    // Append the new row to the sheet
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:G',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow],
      },
    })

    console.log('Ticket created successfully:', {
      ticketNumber: nextTicketNumber,
      buyer: name,
      seller: seller,
      timestamp: timestamp
    })

    return NextResponse.json({
      success: true,
      ticketNumber: nextTicketNumber,
      timestamp: timestamp,
      message: 'Ticket created successfully'
    })

  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Direct implementation without importing the GoogleSheetsService
async function getTicketData() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'A:J', // Expanded range to include attendance columns
    })

    const rows = response.data.values || []
    const headers = rows[0] || []
    const dataRows = rows.slice(1)

    // Process ticket data
    const entries = dataRows.map((row, index) => {
      // Check if ticket has been verified (payment status is VERIFIED)
      const isVerified = row[6] === 'VERIFIED'
      
      // Check if attendee has checked in at the event
      const hasAttended = row[8] === 'ATTENDED'
      
      return {
        timestamp: row[0] || '',
        name: row[1] || '',
        email: row[2] || '',
        paymentMethod: row[3] || 'Cash',
        seller: row[4] || '',
        ticketNumber: row[5] || `IEEE-UJ-${String(index + 1).padStart(4, '0')}`,
        paymentStatus: row[6] || (row[3] === 'Cash' ? 'VERIFIED' : 'PENDING'),
        verificationNotes: row[7] || '',
        attended: hasAttended,
        attendedAt: hasAttended ? row[9] || undefined : undefined,
        verified: isVerified,
      }
    })

    return entries
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    throw error
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const identifier = searchParams.get('identifier')

    if (!identifier) {
      return NextResponse.json({
        valid: false,
        message: 'Please provide a ticket number or email'
      }, { status: 400 })
    }

    // Get all tickets directly
    const tickets = await getTicketData()
    
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({
        valid: false,
        message: 'No tickets found in the system'
      }, { status: 404 })
    }

    // Check if the identifier matches any ticket number or email
    const matchingTicket = tickets.find(ticket => 
      ticket.ticketNumber === identifier.trim() || 
      ticket.email?.toLowerCase() === identifier.trim().toLowerCase()
    )

    if (!matchingTicket) {
      return NextResponse.json({
        valid: false,
        message: 'No matching ticket found. Please check your ticket number or email and try again.'
      }, { status: 404 })
    }

    // Get event details from config or environment variables
    const eventName = process.env.EVENT_NAME || 'IEEE UJ Event'
    const eventDate = process.env.EVENT_DATE || 'TBA'
    const eventLocation = process.env.EVENT_LOCATION || 'University of Johannesburg'

    // Return success with limited ticket details (only what's necessary for verification)
    return NextResponse.json({
      valid: true,
      message: 'Your ticket is valid!',
      ticketDetails: {
        ticketNumber: matchingTicket.ticketNumber,
        name: matchingTicket.name,
        email: matchingTicket.email,
        paymentVerified: matchingTicket.paymentStatus === 'VERIFIED',
        eventName,
        eventDate,
        eventLocation
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Error in public ticket verification:', error)
    return NextResponse.json({
      valid: false,
      message: 'Error verifying ticket'
    }, { status: 500 })
  }
}

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
    const { ticketNumber, status, notes, verifiedAt } = body

    // Validate required fields
    if (!ticketNumber || !status) {
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

    // Get current data to find the ticket
    const currentDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:H', // Updated range to match current structure
    })

    const rows = currentDataResponse.data.values || []
    const headers = rows[0] || []
    const dataRows = rows.slice(1)

    // Find the row with the matching ticket number
    const ticketRowIndex = dataRows.findIndex(row => row[5] === ticketNumber) // Column F is ticket number

    if (ticketRowIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Update the row with payment verification info
    // Add payment status (Column G) and verification notes (Column H)
    const rowNumber = ticketRowIndex + 2 // +1 for header, +1 for 1-based indexing
    
    // Update payment status column (G)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `G${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status === 'verified' ? 'VERIFIED' : 'REJECTED']],
      },
    })

    // Update verification notes column (H) if notes provided
    if (notes) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `H${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[`${notes} (Verified: ${verifiedAt})`]],
        },
      })
    }

    console.log('Payment verification updated:', {
      ticketNumber,
      status,
      verifiedBy: session.user?.email,
      timestamp: verifiedAt
    })

    return NextResponse.json({
      success: true,
      ticketNumber,
      status,
      message: `Payment ${status} successfully`
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Set up Google Sheets directly - matching the exact setup in sheets.ts
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticketNumber, method, verifiedBy, verifiedAt } = body

    if (!ticketNumber) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ticket number is required' 
      }, { status: 400 })
    }

    // Get current sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:H', // Use explicit sheet name for consistency
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No ticket data found' 
      }, { status: 404 })
    }

    // Find the ticket
    const headers = rows[0]
    const ticketRowIndex = rows.findIndex((row: string[], index: number) => {
      if (index === 0) return false // Skip header row
      return row[5] === ticketNumber // Column F (index 5) contains ticket number
    })

    if (ticketRowIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ticket not found' 
      }, { status: 404 })
    }

    const ticketRow = rows[ticketRowIndex]
    
    // Check if ticket is already verified - Column H (index 7) for verification status
    // No need to check if column exists, we know it's at index 7
    if (ticketRow && ticketRow.length > 7 && ticketRow[7] === 'VERIFIED') {
      return NextResponse.json({ 
        success: false, 
        message: 'Ticket already verified' 
      }, { status: 409 })
    }

    // Check payment status - Column G (index 6) for payment status
    // Check if payment has been verified
    if (ticketRow && ticketRow.length > 6 && ticketRow[6] !== 'VERIFIED') {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment not verified. Cannot admit entry.' 
      }, { status: 403 })
    }

    // Update verification status in Google Sheets - use specific columns
    // Need to account for header row and 1-indexed rows in Google Sheets
    const updateRange = `Sheet1!H${ticketRowIndex + 2}`
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['VERIFIED']] // Mark as verified
      },
    })

    // Log verification event
    console.log(`Ticket ${ticketNumber} verified by ${verifiedBy} at ${verifiedAt} via ${method}`)

    return NextResponse.json({
      success: true,
      message: 'Ticket verified successfully',
      ticket: {
        ticketNumber,
        buyerName: ticketRow[0], // Assuming column A is buyer name
        buyerEmail: ticketRow[1], // Assuming column B is buyer email
        seller: ticketRow[4], // Assuming column E is seller
        verifiedAt,
        verifiedBy,
        method
      }
    })

  } catch (error) {
    console.error('Ticket verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during verification',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get verification statistics
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:H', // Use explicit sheet name for consistency
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      return NextResponse.json({ 
        totalTickets: 0,
        verifiedTickets: 0,
        pendingVerification: 0
      })
    }

    const headers = rows[0]
    const dataRows = rows.slice(1)
    
    // Column H (index 7) has verification status
    const verifiedColumnIndex = 7
    
    const totalTickets = dataRows.length
    const verifiedTickets = dataRows.filter((row: string[]) => 
      row.length > verifiedColumnIndex && row[verifiedColumnIndex] === 'VERIFIED'
    ).length
    const pendingVerification = totalTickets - verifiedTickets

    return NextResponse.json({
      totalTickets,
      verifiedTickets,
      pendingVerification,
      verificationRate: totalTickets > 0 ? (verifiedTickets / totalTickets * 100).toFixed(1) : '0'
    })

  } catch (error) {
    console.error('Verification stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get verification statistics' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SHEET_ID = process.env.GOOGLE_SHEET_ID

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
      range: 'Sheet1!A:K', // Assuming columns A-K contain ticket data
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
    const ticketRowIndex = rows.findIndex((row, index) => 
      index > 0 && row[5] === ticketNumber // Assuming column F (index 5) contains ticket numbers
    )

    if (ticketRowIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ticket not found' 
      }, { status: 404 })
    }

    const ticketRow = rows[ticketRowIndex]
    
    // Check if ticket is already verified
    const verifiedColumnIndex = headers.findIndex(header => 
      header.toLowerCase().includes('verified') || header.toLowerCase().includes('checked')
    )
    
    if (verifiedColumnIndex !== -1 && ticketRow[verifiedColumnIndex] === 'TRUE') {
      return NextResponse.json({ 
        success: false, 
        message: 'Ticket already verified' 
      }, { status: 409 })
    }

    // Check payment status
    const paymentStatusIndex = headers.findIndex(header => 
      header.toLowerCase().includes('payment') && header.toLowerCase().includes('status')
    )
    
    if (paymentStatusIndex !== -1 && ticketRow[paymentStatusIndex] !== 'VERIFIED') {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment not verified. Cannot admit entry.' 
      }, { status: 403 })
    }

    // Update verification status in Google Sheets
    const updateRange = `Sheet1!${String.fromCharCode(65 + Math.max(headers.length, 10))}${ticketRowIndex + 1}:${String.fromCharCode(65 + Math.max(headers.length, 12))}${ticketRowIndex + 1}`
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['TRUE', verifiedAt, verifiedBy]] // Verified, VerifiedAt, VerifiedBy
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
      range: 'Sheet1!A:K',
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
    
    const verifiedColumnIndex = headers.findIndex(header => 
      header.toLowerCase().includes('verified') || header.toLowerCase().includes('checked')
    )
    
    const totalTickets = dataRows.length
    const verifiedTickets = verifiedColumnIndex !== -1 
      ? dataRows.filter(row => row[verifiedColumnIndex] === 'TRUE').length 
      : 0
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

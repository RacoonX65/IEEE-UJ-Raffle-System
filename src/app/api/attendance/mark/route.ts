import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Set up Google Sheets directly - matching the setup in sheets.ts
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

    // Get request data
    const { ticketNumber, method, markedBy } = await request.json()

    if (!ticketNumber) {
      return NextResponse.json({ error: 'Ticket number is required' }, { status: 400 })
    }

    // Get current sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J', // Extended range to include attendance columns
    })

    const rows = response.data.values || []
    if (rows.length <= 1) {
      return NextResponse.json({ error: 'No ticket data found' }, { status: 404 })
    }

    // Find the ticket
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
    
    // Check if payment is verified
    if (ticketRow[6] !== 'VERIFIED') {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment not verified. Cannot mark attendance.' 
      }, { status: 403 })
    }

    // Get current attendance status
    const currentAttendance = ticketRow.length > 8 ? ticketRow[8] : ''
    
    // If already attended, don't allow duplicate check-in
    if (currentAttendance === 'ATTENDED') {
      return NextResponse.json({
        success: false,
        message: 'Attendee already checked in',
        ticketDetails: {
          name: ticketRow[1],
          email: ticketRow[2],
          ticketNumber: ticketRow[5],
          attendedAt: ticketRow.length > 9 ? ticketRow[9] : undefined
        }
      }, { status: 400 })
    }
    
    // Mark attendance in column I and timestamp in column J
    const timestamp = new Date().toISOString()
    
    // Update attendance status (Column I)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${ticketRowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['ATTENDED']]
      },
    })
    
    // Update attendance timestamp (Column J)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!J${ticketRowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timestamp]]
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      ticketDetails: {
        name: ticketRow[1],
        email: ticketRow[2],
        ticketNumber: ticketRow[5],
        attendedAt: timestamp
      }
    })
    
  } catch (error) {
    console.error('Error marking attendance:', error)
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get attendance statistics
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J', // Include attendance columns
    })

    const rows = response.data.values || []
    if (rows.length <= 1) {
      return NextResponse.json({ 
        totalTickets: 0,
        attendedCount: 0,
        absentCount: 0
      })
    }

    const headers = rows[0]
    const dataRows = rows.slice(1)
    
    // Column I (index 8) has attendance status
    const attendanceColumnIndex = 8
    
    const totalTickets = dataRows.length
    const attendedCount = dataRows.filter((row: string[]) => 
      row.length > attendanceColumnIndex && row[attendanceColumnIndex] === 'ATTENDED'
    ).length
    const absentCount = totalTickets - attendedCount

    return NextResponse.json({
      totalTickets,
      attendedCount,
      absentCount
    })
    
  } catch (error) {
    console.error('Error getting attendance statistics:', error)
    return NextResponse.json({ error: 'Failed to get attendance statistics' }, { status: 500 })
  }
}

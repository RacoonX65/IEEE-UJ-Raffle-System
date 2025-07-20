import { NextRequest, NextResponse } from 'next/server'
import { sheetsService } from '@/lib/sheets'

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

    // Get all tickets from the sheet
    const ticketData = await sheetsService.getTicketData()
    const tickets = ticketData.recentEntries
    
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

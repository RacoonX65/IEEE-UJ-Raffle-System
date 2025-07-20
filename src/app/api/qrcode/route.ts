import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { qrCodeService } from '@/lib/qrcode'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticketNumber, buyerName, buyerEmail, sellerName, timestamp, eventId, format = 'dataurl' } = body

    // Validate required fields
    if (!ticketNumber || !buyerName || !buyerEmail || !sellerName || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketNumber, buyerName, buyerEmail, sellerName, timestamp' },
        { status: 400 }
      )
    }

    const ticketData = {
      ticketNumber,
      buyerName,
      buyerEmail,
      sellerName,
      timestamp,
      eventId
    }

    console.log('QR Code API: Generating QR code for ticket:', ticketData.ticketNumber)
    
    let qrCode: string
    if (format === 'svg') {
      qrCode = await qrCodeService.generateQRCodeSVG(ticketData)
    } else {
      qrCode = await qrCodeService.generateQRCode(ticketData)
    }

    const verificationUrl = qrCodeService.generateVerificationUrl(ticketData)

    console.log('QR Code API: Successfully generated QR code')
    
    return NextResponse.json({
      success: true,
      qrCode,
      verificationUrl,
      format
    })
  } catch (error) {
    console.error('QR Code API: Error generating QR code:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { 
        error: 'Failed to generate QR code',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticketNumber = searchParams.get('ticketNumber')
    const buyerName = searchParams.get('buyerName')
    const buyerEmail = searchParams.get('buyerEmail')
    const sellerName = searchParams.get('sellerName')
    const timestamp = searchParams.get('timestamp')
    const eventId = searchParams.get('eventId')
    const format = searchParams.get('format') || 'dataurl'

    // Validate required fields
    if (!ticketNumber || !buyerName || !buyerEmail || !sellerName || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      )
    }

    const ticketData = {
      ticketNumber,
      buyerName,
      buyerEmail,
      sellerName,
      timestamp,
      eventId: eventId || undefined
    }

    let qrCode: string
    if (format === 'svg') {
      qrCode = await qrCodeService.generateQRCodeSVG(ticketData)
      return new NextResponse(qrCode, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600'
        }
      })
    } else {
      qrCode = await qrCodeService.generateQRCode(ticketData)
      // Extract base64 data from data URL
      const base64Data = qrCode.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600'
        }
      })
    }
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

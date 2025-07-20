'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { qrCodeService, VerificationResult } from '@/lib/qrcode'
import { CheckCircle, XCircle, AlertCircle, Ticket, User, Mail, Clock, Shield } from 'lucide-react'

export default function VerifyTicketPage() {
  const params = useParams()
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyTicket = async () => {
      try {
        const token = params.token as string
        if (!token) {
          setVerificationResult({
            isValid: false,
            error: 'No verification token provided'
          })
          return
        }

        const result = qrCodeService.verifyTicket(token)
        setVerificationResult(result)
      } catch (error) {
        console.error('Verification error:', error)
        setVerificationResult({
          isValid: false,
          error: 'Failed to verify ticket'
        })
      } finally {
        setLoading(false)
      }
    }

    verifyTicket()
  }, [params.token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
            Ticket Verification
          </h1>
          <p className="text-purple-200">IEEE University of Johannesburg</p>
        </div>

        {/* Verification Result */}
        <div className="space-y-6">
          {verificationResult?.isValid ? (
            // Valid Ticket
            <div className="space-y-6">
              {/* Success Status */}
              <div className="flex items-center justify-center space-x-3 p-4 bg-green-500/20 rounded-2xl border border-green-400/30">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <h2 className="text-xl font-semibold text-green-400">✅ Valid Ticket</h2>
                  <p className="text-green-300">This ticket is authentic and verified</p>
                </div>
              </div>

              {/* Ticket Details */}
              {verificationResult.ticket && (
                <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Ticket className="h-5 w-5 mr-2" />
                    Ticket Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Ticket className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-purple-300">Ticket Number</p>
                          <p className="text-white font-mono font-semibold">
                            {verificationResult.ticket.ticketNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-purple-300">Buyer Name</p>
                          <p className="text-white font-semibold">
                            {verificationResult.ticket.buyerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-purple-300">Email</p>
                          <p className="text-white break-all">
                            {verificationResult.ticket.buyerEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-purple-300">Sold By</p>
                          <p className="text-white font-semibold">
                            {verificationResult.ticket.sellerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-purple-300">Purchase Date</p>
                          <p className="text-white">
                            {new Date(verificationResult.ticket.timestamp).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {verificationResult.ticket.eventId && (
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-purple-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-purple-300">Event</p>
                            <p className="text-white font-semibold">
                              {verificationResult.ticket.eventId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-purple-400" />
                      <span className="text-sm text-purple-300">
                        Cryptographically verified and secure
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Invalid Ticket
            <div className="space-y-6">
              {/* Error Status */}
              <div className="flex items-center justify-center space-x-3 p-4 bg-red-500/20 rounded-2xl border border-red-400/30">
                <XCircle className="h-8 w-8 text-red-400" />
                <div>
                  <h2 className="text-xl font-semibold text-red-400">❌ Invalid Ticket</h2>
                  <p className="text-red-300">This ticket could not be verified</p>
                </div>
              </div>

              {/* Error Details */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Error Details
                </h3>
                <p className="text-red-300 bg-red-500/10 p-3 rounded-lg">
                  {verificationResult?.error || 'Unknown verification error'}
                </p>
              </div>

              {/* Help Information */}
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
                <div className="space-y-2 text-purple-200">
                  <p>• Ensure you&apos;re scanning the correct QR code from your ticket</p>
                  <p>• Check that your ticket was purchased through official channels</p>
                  <p>• Contact IEEE UJ support if you believe this is an error</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-purple-300">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Powered by IEEE UJ Raffle System</span>
          </div>
        </div>
      </div>
    </div>
  )
}

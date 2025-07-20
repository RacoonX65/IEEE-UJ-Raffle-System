'use client'

import { useState } from 'react'
import { Search, Ticket, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'

interface TicketVerification {
  valid: boolean
  message: string
  ticketDetails?: {
    ticketNumber: string
    name: string
    email: string
    paymentVerified: boolean
    eventName?: string
    eventDate?: string
    eventLocation?: string
  }
}

export default function PublicTicketVerification() {
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationResult, setVerificationResult] = useState<TicketVerification | null>(null)
  const [loading, setLoading] = useState(false)
  
  const verifyTicket = async (identifier: string) => {
    if (!identifier.trim()) {
      toast.error('Please enter a ticket number or email')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/ticket-check?identifier=${encodeURIComponent(identifier.trim())}`)
      
      if (response.ok) {
        const result = await response.json()
        setVerificationResult(result)
        
        if (result.valid) {
          toast.success('Valid ticket found!')
        } else {
          toast.error(result.message || 'Invalid ticket')
        }
      } else {
        toast.error('Error verifying ticket')
        setVerificationResult({
          valid: false,
          message: 'Error connecting to verification service'
        })
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      toast.error('Error verifying ticket')
      setVerificationResult({
        valid: false,
        message: 'Error connecting to verification service'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Toaster />
      
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-purple-400 mr-2" />
              <h1 className="text-2xl font-bold text-white">Ticket Verification</h1>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Verify Your IEEE UJ Ticket</h2>
          <p className="text-white/70">
            Enter your ticket number or the email you used for registration below to verify your ticket.
          </p>
        </div>
        
        {/* IEEE Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Image 
              src="/favicon.svg" 
              width={80} 
              height={80} 
              alt="IEEE Logo" 
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Verification Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter ticket number or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 text-white border border-white/20 rounded-xl py-3 px-5 pr-12 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyUp={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    verifyTicket(searchQuery)
                  }
                }}
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white focus:outline-none"
                onClick={() => !loading && verifyTicket(searchQuery)}
                disabled={loading}
              >
                <Search className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            
            <button
              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-purple-600/50 text-white/70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
              }`}
              onClick={() => !loading && verifyTicket(searchQuery)}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Ticket'}
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Ticket className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Verification Result */}
        {verificationResult && (
          <div className="mb-8">
            <div className={`rounded-3xl p-6 ${
              verificationResult.valid
                ? 'bg-green-500/20 backdrop-blur-sm border border-green-500/30'
                : 'bg-red-500/20 backdrop-blur-sm border border-red-500/30'
            }`}>
              <div className="flex items-center mb-4">
                {verificationResult.valid ? (
                  <CheckCircle className="h-8 w-8 text-green-400 mr-3" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-400 mr-3" />
                )}
                <h3 className={`text-xl font-bold ${
                  verificationResult.valid ? 'text-green-300' : 'text-red-300'
                }`}>
                  {verificationResult.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                </h3>
              </div>
              
              <p className="text-white/70 mb-4">
                {verificationResult.message}
              </p>
              
              {verificationResult.valid && verificationResult.ticketDetails && (
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Ticket Number</p>
                      <p className="text-white font-medium">{verificationResult.ticketDetails.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Name</p>
                      <p className="text-white font-medium">{verificationResult.ticketDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Email</p>
                      <p className="text-white font-medium">{verificationResult.ticketDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Payment Status</p>
                      <div className="flex items-center">
                        {verificationResult.ticketDetails.paymentVerified ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-400 mr-1.5" />
                            <span className="text-green-300 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-1.5" />
                            <span className="text-yellow-300 font-medium">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  
                    {verificationResult.ticketDetails.eventName && (
                      <div>
                        <p className="text-white/60 text-sm">Event</p>
                        <p className="text-white font-medium">{verificationResult.ticketDetails.eventName}</p>
                      </div>
                    )}
                    {verificationResult.ticketDetails.eventDate && (
                      <div>
                        <p className="text-white/60 text-sm">Date</p>
                        <p className="text-white font-medium">{verificationResult.ticketDetails.eventDate}</p>
                      </div>
                    )}
                    {verificationResult.ticketDetails.eventLocation && (
                      <div>
                        <p className="text-white/60 text-sm">Location</p>
                        <p className="text-white font-medium">{verificationResult.ticketDetails.eventLocation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">How it works</h3>
          <div className="space-y-3 text-white/70 text-sm">
            <p>
              This verification tool allows you to confirm that your IEEE UJ ticket is valid.
            </p>
            <p>
              <span className="font-medium text-purple-300">For ticket holders:</span> Enter your ticket number or the email address you used during registration.
            </p>
            <p>
              <span className="font-medium text-purple-300">Valid tickets:</span> Will display all your ticket details, confirming your place at the event.
            </p>
            <p>
              <span className="font-medium text-purple-300">Questions or issues?</span> Please contact the IEEE UJ team directly if you have any problems verifying your ticket.
            </p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-blue-500/20 backdrop-blur-sm rounded-3xl p-6 border border-blue-400/30">
          <h3 className="text-lg font-bold text-blue-300 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Information
          </h3>
          
          <div className="space-y-5 text-white/90 text-sm">
            <div>
              <h4 className="font-medium text-blue-200 mb-2">Payment Methods</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><span className="font-medium">Cash:</span> Pay in person at the IEEE UJ office or designated ticket sellers</li>
                <li><span className="font-medium">EFT (Bank Transfer):</span> Use the bank details below</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-200 mb-2">FNB Bank Details</h4>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-white/70">Account Holder:</div>
                  <div className="font-medium">MR MQHELOMHLE N MTHUNZI</div>
                  
                  <div className="text-white/70">Bank:</div>
                  <div className="font-medium">First National Bank (FNB)</div>
                  
                  <div className="text-white/70">Account Type:</div>
                  <div className="font-medium">FNB EASY ACCOUNT</div>
                  
                  <div className="text-white/70">Account Number:</div>
                  <div className="font-medium">63042909185</div>
                  
                  <div className="text-white/70">Branch Code:</div>
                  <div className="font-medium">250841</div>
                  
                  <div className="text-white/70">Branch Name:</div>
                  <div className="font-medium">FNB POP BRANCH DEL GAU WES</div>
                  
                  <div className="text-white/70">Reference:</div>
                  <div className="font-medium">IEEE UJ + Your Name</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-200 mb-2">Important Notes</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>After making an EFT payment, please allow up to 24 hours for verification</li>
                <li>Always use your name and ticket number as the payment reference</li>
                <li>For any payment queries, contact the IEEE UJ treasurer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

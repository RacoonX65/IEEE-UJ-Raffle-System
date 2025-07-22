'use client'

import { useState, useEffect } from 'react'
import { Search, Ticket, CheckCircle, XCircle, AlertTriangle, Award, Calendar, MapPin, Mail, User, CreditCard } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import Head from 'next/head'

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
  const [showConfetti, setShowConfetti] = useState(false)
  
  const verifyTicket = async (identifier: string) => {
    if (!identifier.trim()) {
      toast.error('Please enter a ticket number or email')
      return
    }
    
    setLoading(true)
    setShowConfetti(false)
    
    try {
      const response = await fetch(`/api/ticket-check?identifier=${encodeURIComponent(identifier.trim())}`)
      
      if (response.ok) {
        const result = await response.json()
        setVerificationResult(result)
        
        if (result.valid) {
          toast.success('Valid ticket found!', {
            icon: '🎉',
            style: {
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00629B 0%, #0078d4 100%)',
              color: '#fff',
              fontWeight: 'bold',
            },
            duration: 5000,
          })
          setShowConfetti(true)
        } else {
          toast.error(result.message || 'Invalid ticket', {
            style: {
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)',
              color: '#fff',
              fontWeight: 'bold',
            },
            duration: 4000,
          })
        }
      } else {
        toast.error('Error verifying ticket', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        setVerificationResult({
          valid: false,
          message: 'Error connecting to verification service'
        })
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      toast.error('Error verifying ticket', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
      setVerificationResult({
        valid: false,
        message: 'Error connecting to verification service'
      })
    } finally {
      setLoading(false)
    }
  }

  // Effect to reset confetti after a few seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "url('https://i.imgur.com/JWPjXV9.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay"
        }}></div>
      </div>
      
      <Toaster position="top-center" />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="https://i.imgur.com/Wd9OgB7.gif" 
              alt="Confetti celebration" 
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-800 to-indigo-800 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full">
                <Ticket className="h-8 w-8 text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">IEEE UJ Ticket Verification</h1>
                <p className="text-blue-200 text-sm">Verify your ticket instantly</p>
              </div>
            </div>
            <div className="hidden md:block">
              <Image 
                src="/favicon.svg" 
                width={50} 
                height={50} 
                alt="IEEE Logo" 
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 relative">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Verify Your IEEE UJ Ticket
            </h2>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Enter your ticket number or email below to instantly verify your ticket status.
            </p>
          </div>
        </div>
        
        {/* IEEE Logo with Glow Effect */}
        <div className="flex justify-center mb-10 relative">
          <div className="absolute inset-0 bg-blue-500 filter blur-xl opacity-30 rounded-full transform scale-75"></div>
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl relative z-10">
            <div className="absolute inset-0 rounded-full animate-pulse opacity-50 bg-blue-400 blur-md"></div>
            <Image 
              src="/favicon.svg" 
              width={100} 
              height={100} 
              alt="IEEE Logo" 
              className="object-contain relative z-10"
            />
          </div>
        </div>
        
        {/* Verification Form */}
        <div className="bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-400/30 mb-10 shadow-2xl transform hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-10 -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400 rounded-full filter blur-3xl opacity-10 translate-x-10 translate-y-10"></div>
          
          <h3 className="text-xl font-bold text-white mb-6 text-center">Enter Your Ticket Details</h3>
          
          <div className="space-y-6 relative z-10">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Enter ticket number or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white border border-blue-400/30 rounded-xl py-4 pl-12 pr-5 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-blue-200/50 shadow-inner transition-all duration-300"
                onKeyUp={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    verifyTicket(searchQuery)
                  }
                }}
              />
            </div>
            
            <button
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                loading
                  ? 'bg-blue-600/50 text-white/70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:translate-y-[-2px]'
              }`}
              onClick={() => !loading && verifyTicket(searchQuery)}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify My Ticket'}
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Ticket className="h-5 w-5" />
              )}
            </button>
          </div>
          
          <div className="text-center mt-4 text-blue-200/70 text-sm">
            Enter your ticket number (e.g., IEEE-UJ-0001) or the email you used during registration
          </div>
        </div>
        
        {/* Verification Result */}
        {verificationResult && (
          <div className="mb-10 animate-fadeIn">
            <div className={`rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden ${
              verificationResult.valid
                ? 'bg-gradient-to-br from-green-900/80 to-emerald-900/80 border border-green-400/30'
                : 'bg-gradient-to-br from-red-900/80 to-rose-900/80 border border-red-400/30'
            }`}>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full filter blur-3xl opacity-20 -translate-x-10 -translate-y-10"
                style={{
                  backgroundColor: verificationResult.valid ? '#4ade80' : '#f87171'
                }}
              ></div>
              
              {/* Result Header */}
              <div className="flex flex-col items-center mb-6 text-center relative z-10">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 ${
                  verificationResult.valid ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {verificationResult.valid ? (
                    <CheckCircle className={`h-12 w-12 ${verificationResult.valid ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-400" />
                  )}
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${
                  verificationResult.valid ? 'text-green-300' : 'text-red-300'
                }`}>
                  {verificationResult.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                </h3>
                
                <p className="text-white/80 text-lg">
                  {verificationResult.message}
                </p>
              </div>
              
              {/* Ticket Details Card */}
              {verificationResult.valid && verificationResult.ticketDetails && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-inner">
                  <h4 className="text-white font-bold text-lg mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-300" />
                    Ticket Details
                  </h4>
                  
                  {/* Ticket Number - Highlighted */}
                  <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl p-4 mb-6 border border-blue-500/30 shadow-md">
                    <p className="text-blue-300 text-sm font-medium mb-1">Ticket Number</p>
                    <p className="text-white text-2xl font-bold tracking-wider">
                      {verificationResult.ticketDetails.ticketNumber}
                    </p>
                  </div>
                  
                  {/* Other Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <div className="flex items-center text-blue-300">
                        <User className="h-4 w-4 mr-2" />
                        <p className="text-sm font-medium">Name</p>
                      </div>
                      <p className="text-white font-medium pl-6">{verificationResult.ticketDetails.name}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-blue-300">
                        <Mail className="h-4 w-4 mr-2" />
                        <p className="text-sm font-medium">Email</p>
                      </div>
                      <p className="text-white font-medium pl-6 break-all">{verificationResult.ticketDetails.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-blue-300">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <p className="text-sm font-medium">Payment Status</p>
                      </div>
                      <div className="flex items-center pl-6">
                        {verificationResult.ticketDetails.paymentVerified ? (
                          <>
                            <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mr-2">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <span className="text-green-300 font-medium">Payment Verified</span>
                          </>
                        ) : (
                          <>
                            <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center mr-2 animate-pulse">
                              <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span className="text-yellow-300 font-medium">Payment Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  
                    {verificationResult.ticketDetails.eventName && (
                      <div className="space-y-1">
                        <div className="flex items-center text-blue-300">
                          <Award className="h-4 w-4 mr-2" />
                          <p className="text-sm font-medium">Event</p>
                        </div>
                        <p className="text-white font-medium pl-6">{verificationResult.ticketDetails.eventName}</p>
                      </div>
                    )}
                    
                    {verificationResult.ticketDetails.eventDate && (
                      <div className="space-y-1">
                        <div className="flex items-center text-blue-300">
                          <Calendar className="h-4 w-4 mr-2" />
                          <p className="text-sm font-medium">Date</p>
                        </div>
                        <p className="text-white font-medium pl-6">{verificationResult.ticketDetails.eventDate}</p>
                      </div>
                    )}
                    
                    {verificationResult.ticketDetails.eventLocation && (
                      <div className="space-y-1">
                        <div className="flex items-center text-blue-300">
                          <MapPin className="h-4 w-4 mr-2" />
                          <p className="text-sm font-medium">Location</p>
                        </div>
                        <p className="text-white font-medium pl-6">{verificationResult.ticketDetails.eventLocation}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Valid Ticket Badge */}
                  {verificationResult.valid && (
                    <div className="mt-6 flex justify-center">
                      <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-500/30 font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        This ticket is valid for entry
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-xl rounded-3xl p-8 border border-indigo-400/30 mb-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-400 rounded-full filter blur-3xl opacity-10 translate-x-10 -translate-y-20"></div>
          
          <div className="flex items-center mb-6 relative z-10">
            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-indigo-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">How Ticket Verification Works</h3>
          </div>
          
          <div className="space-y-5 text-white/80 relative z-10 pl-14">
            <div className="relative">
              <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-300 font-bold text-sm">1</span>
              </div>
              <p className="text-base">
                Enter your <span className="font-semibold text-blue-300">ticket number</span> or the <span className="font-semibold text-blue-300">email address</span> you used during registration.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-300 font-bold text-sm">2</span>
              </div>
              <p className="text-base">
                Our system will instantly verify your ticket and display all relevant details.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-300 font-bold text-sm">3</span>
              </div>
              <p className="text-base">
                For valid tickets, you'll see your ticket number, personal details, and payment status.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-300 font-bold text-sm">?</span>
              </div>
              <p className="text-base">
                <span className="font-semibold text-indigo-300">Need help?</span> Contact the IEEE UJ team at <a href="mailto:ieee@uj.ac.za" className="text-blue-300 underline hover:text-blue-200 transition-colors">ieee@uj.ac.za</a> for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gradient-to-br from-blue-900/70 to-indigo-900/70 backdrop-blur-xl rounded-3xl p-8 border border-blue-400/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-10 -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400 rounded-full filter blur-3xl opacity-10 translate-x-10 translate-y-10"></div>
          
          <div className="flex items-center mb-6 relative z-10">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center mr-4 shadow-lg border border-blue-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Information</h3>
              <p className="text-blue-200 text-sm">Complete your payment to confirm your ticket</p>
            </div>
          </div>
          
          <div className="space-y-6 text-white/90 relative z-10">
            {/* Payment Methods */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-inner">
              <h4 className="font-semibold text-blue-300 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payment Methods
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-blue-300">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h5 className="font-medium text-white">Cash Payment</h5>
                  </div>
                  <p className="text-blue-100 pl-11">Pay in person at the IEEE UJ office or designated ticket sellers</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-blue-300">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h5 className="font-medium text-white">EFT (Bank Transfer)</h5>
                  </div>
                  <p className="text-blue-100 pl-11">Transfer funds using the bank details provided below</p>
                </div>
              </div>
            </div>
            
            {/* Bank Details */}
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-xl p-5 border border-blue-500/30 shadow-lg">
              <h4 className="font-semibold text-blue-300 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                FNB Bank Details
              </h4>
              
              <div className="bg-black/20 backdrop-blur-md rounded-lg p-5 border border-white/10 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-blue-300 text-sm">Account Holder</p>
                    <p className="text-white font-medium">MR MQHELOMHLE N MTHUNZI</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-blue-300 text-sm">Bank</p>
                    <p className="text-white font-medium">First National Bank (FNB)</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-blue-300 text-sm">Account Type</p>
                    <p className="text-white font-medium">FNB EASY ACCOUNT</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-blue-300 text-sm">Account Number</p>
                    <p className="text-white font-medium tracking-wider">63042909185</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-blue-300 text-sm">Branch Code</p>
                    <p className="text-white font-medium">250841</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-blue-300 text-sm">Branch Name</p>
                    <p className="text-white font-medium">FNB POP BRANCH DEL GAU WES</p>
                  </div>
                  
                  <div className="space-y-1 md:col-span-2 bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
                    <p className="text-blue-300 text-sm">Reference</p>
                    <p className="text-white font-medium">IEEE UJ + Your Name</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Important Notes */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-5 border border-amber-500/30">
              <h4 className="font-semibold text-amber-300 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Important Payment Notes
              </h4>
              
              <div className="space-y-3 pl-7">
                <div className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-amber-300 text-xs">1</span>
                  </div>
                  <p className="text-white">After making an EFT payment, please allow up to 24 hours for verification</p>
                </div>
                
                <div className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-amber-300 text-xs">2</span>
                  </div>
                  <p className="text-white">Always use your name and ticket number as the payment reference</p>
                </div>
                
                <div className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-amber-300 text-xs">3</span>
                  </div>
                  <p className="text-white">For any payment queries, contact the IEEE UJ treasurer at <a href="mailto:treasurer@ieeeuj.org" className="text-amber-300 underline hover:text-amber-200 transition-colors">treasurer@ieeeuj.org</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500 rounded-full filter blur-[100px] opacity-20 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full filter blur-[100px] opacity-20 -translate-y-1/2"></div>
        
        <div className="relative z-10 py-8 border-t border-white/10 text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="h-12 w-12 relative mr-3">
              <Image 
                src="/ieee-logo-light.png" 
                alt="IEEE Logo" 
                width={48} 
                height={48} 
                className="object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">IEEE UJ</h3>
              <p className="text-white/70 text-sm">University of Johannesburg Student Branch</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 mb-6">
            <a href="https://www.instagram.com/ieee_uj/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/ieee-uj/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="mailto:ieee@uj.ac.za" className="text-white/70 hover:text-white transition-colors">
              <span className="sr-only">Email</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
          
          <div className="text-white/50 text-sm">
            <p>© {new Date().getFullYear()} IEEE University of Johannesburg Student Branch</p>
            <p className="mt-1">All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  )
}

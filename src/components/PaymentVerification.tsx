'use client'

import { useState } from 'react'
import { Check, X, Clock, Upload, Eye, Download } from 'lucide-react'

interface PaymentVerificationProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    ticketNumber: string
    buyerName: string
    paymentMethod: string
    amount: number
  }
}

export default function PaymentVerification({ isOpen, onClose, ticket }: PaymentVerificationProps) {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const [notes, setNotes] = useState('')

  const handleVerify = async (status: 'verified' | 'rejected') => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketNumber: ticket.ticketNumber,
          status,
          notes,
          verifiedAt: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setVerificationStatus(status)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-md w-full border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Payment Verification</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Ticket Details */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-purple-200">Ticket:</span>
              <span className="text-white font-mono">{ticket.ticketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Buyer:</span>
              <span className="text-white">{ticket.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Payment Method:</span>
              <span className="text-white">{ticket.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Amount:</span>
              <span className="text-white font-bold">R{ticket.amount}</span>
            </div>
          </div>
        </div>

        {/* Banking Details for EFT */}
        {ticket.paymentMethod === 'EFT' && (
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-6">
            <h4 className="text-blue-300 font-medium mb-3">IEEE UJ FNB Banking Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Account Holder:</span>
                <span className="text-white text-xs">MR MQHELOMHLE N MTHUNZI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Bank:</span>
                <span className="text-white">First National Bank (FNB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Account Number:</span>
                <span className="text-white font-mono">63042909185</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Branch Code:</span>
                <span className="text-white font-mono">250841</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Branch:</span>
                <span className="text-white text-xs">FNB POP BRANCH DEL GAU WES</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Reference:</span>
                <span className="text-white font-mono bg-yellow-500/20 px-2 py-1 rounded">{ticket.ticketNumber}</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
              <p className="text-yellow-300 text-xs">
                <strong>Important:</strong> Please use the ticket number as your payment reference for easy verification.
              </p>
            </div>
          </div>
        )}

        {/* Verification Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Verification Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about payment verification..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Verification Status */}
        {verificationStatus === 'pending' ? (
          <div className="flex gap-3">
            <button
              onClick={() => handleVerify('verified')}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-colors duration-200"
            >
              <Check className="h-5 w-5 mr-2" />
              Verify Payment
            </button>
            <button
              onClick={() => handleVerify('rejected')}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors duration-200"
            >
              <X className="h-5 w-5 mr-2" />
              Reject Payment
            </button>
          </div>
        ) : (
          <div className={`text-center py-4 rounded-xl ${
            verificationStatus === 'verified' 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-red-500/20 text-red-300'
          }`}>
            {verificationStatus === 'verified' ? (
              <div className="flex items-center justify-center">
                <Check className="h-6 w-6 mr-2" />
                Payment Verified Successfully
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <X className="h-6 w-6 mr-2" />
                Payment Rejected
              </div>
            )}
          </div>
        )}

        {/* Instructions for Different Payment Methods */}
        <div className="mt-6 text-xs text-purple-300">
          <div className="bg-white/5 rounded-xl p-3">
            <strong>Verification Instructions:</strong>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Cash:</strong> Confirm cash received in person</li>
              <li>• <strong>EFT:</strong> Check bank statement for transfer</li>
              <li>• <strong>eWallet:</strong> Verify digital wallet notification</li>
              <li>• <strong>Other:</strong> Confirm payment via agreed method</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

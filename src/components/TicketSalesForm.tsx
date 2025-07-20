'use client'

import { useState } from 'react'
import { User, Mail, Phone, CreditCard, Users, Ticket, X, Check } from 'lucide-react'

interface TicketSalesFormProps {
  isOpen: boolean
  onClose: () => void
  onTicketSold: () => void
}

interface TicketFormData {
  name: string
  email: string
  whatsapp: string
  paymentMethod: string
  seller: string
  ticketPrice: number
}

export default function TicketSalesForm({ isOpen, onClose, onTicketSold }: TicketSalesFormProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    name: '',
    email: '',
    whatsapp: '',
    paymentMethod: 'Cash',
    seller: '',
    ticketPrice: 50
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(true)
        
        // Show success for 2 seconds, then close
        setTimeout(() => {
          setSuccess(false)
          onTicketSold()
          onClose()
          // Reset form
          setFormData({
            name: '',
            email: '',
            whatsapp: '',
            paymentMethod: 'Cash',
            seller: '',
            ticketPrice: 50
          })
        }, 2000)
      } else {
        const errorData = await response.json()
        alert(`Failed to create ticket: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-md w-full border border-white/20 max-h-[90vh] overflow-y-auto">
        {success ? (
          // Success State
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Ticket Created!</h3>
            <p className="text-green-300">
              Ticket has been added to the system successfully.
            </p>
          </div>
        ) : (
          // Form State
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Ticket className="h-6 w-6 text-purple-400 mr-2" />
                <h3 className="text-xl font-semibold text-white">Sell New Ticket</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Buyer Name */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Buyer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter buyer's full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="buyer@example.com"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+27123456789"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <CreditCard className="inline h-4 w-4 mr-1" />
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Cash" className="bg-gray-800">💵 Cash (In-Person)</option>
                  <option value="EFT" className="bg-gray-800">🏦 EFT/Bank Transfer (FNB)</option>
                </select>
              </div>

              {/* Seller Name */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Seller Name
                </label>
                <input
                  type="text"
                  name="seller"
                  value={formData.seller}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              {/* Ticket Price */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <CreditCard className="inline h-4 w-4 mr-1" />
                  Ticket Price (R)
                </label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Ticket...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Ticket className="h-5 w-5 mr-2" />
                    Create Ticket
                  </div>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

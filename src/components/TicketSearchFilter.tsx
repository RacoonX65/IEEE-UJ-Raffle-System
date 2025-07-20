'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, User, CreditCard } from 'lucide-react'

interface TicketEntry {
  timestamp: string
  name: string
  email: string
  whatsapp: string
  paymentMethod: string
  seller: string
  ticketNumber: string
  paymentStatus?: string
  verificationNotes?: string
}

interface TicketSearchFilterProps {
  tickets: TicketEntry[]
  onFilteredTickets: (filtered: TicketEntry[]) => void
}

export default function TicketSearchFilter({ tickets, onFilteredTickets }: TicketSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [sellerFilter, setSellerFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique sellers and payment methods for filter options
  const uniqueSellers = Array.from(new Set(tickets.map(t => t.seller).filter(Boolean)))
  const uniquePaymentMethods = Array.from(new Set(tickets.map(t => t.paymentMethod).filter(Boolean)))

  // Apply filters
  const applyFilters = () => {
    let filtered = tickets

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(ticket => 
        ticket.name?.toLowerCase().includes(search) ||
        ticket.email?.toLowerCase().includes(search) ||
        ticket.ticketNumber?.toLowerCase().includes(search) ||
        ticket.seller?.toLowerCase().includes(search)
      )
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(ticket => {
        const status = ticket.paymentMethod === 'Cash' || ticket.paymentStatus === 'VERIFIED' 
          ? 'verified' 
          : ticket.paymentStatus === 'REJECTED' 
          ? 'rejected' 
          : 'pending'
        return status === paymentStatusFilter
      })
    }

    // Seller filter
    if (sellerFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.seller === sellerFilter)
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.paymentMethod === paymentMethodFilter)
    }

    onFilteredTickets(filtered)
  }

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters()
  }, [searchTerm, paymentStatusFilter, sellerFilter, paymentMethodFilter, tickets])

  const clearAllFilters = () => {
    setSearchTerm('')
    setPaymentStatusFilter('all')
    setSellerFilter('all')
    setPaymentMethodFilter('all')
  }

  const activeFiltersCount = [
    searchTerm,
    paymentStatusFilter !== 'all' ? paymentStatusFilter : null,
    sellerFilter !== 'all' ? sellerFilter : null,
    paymentMethodFilter !== 'all' ? paymentMethodFilter : null
  ].filter(Boolean).length

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
          <input
            type="text"
            placeholder="Search by name, email, ticket number, phone, or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            showFilters || activeFiltersCount > 0
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-purple-200 hover:bg-white/20'
          }`}
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/20">
          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Payment Status
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-gray-800">All Status</option>
              <option value="verified" className="bg-gray-800">✅ Verified</option>
              <option value="pending" className="bg-gray-800">⏳ Pending</option>
              <option value="rejected" className="bg-gray-800">❌ Rejected</option>
            </select>
          </div>

          {/* Seller Filter */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Seller
            </label>
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-gray-800">All Sellers</option>
              {uniqueSellers.map(seller => (
                <option key={seller} value={seller} className="bg-gray-800">
                  {seller}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-gray-800">All Methods</option>
              {uniquePaymentMethods.map(method => (
                <option key={method} value={method} className="bg-gray-800">
                  {method === 'Cash' ? '💵 Cash' : '🏦 EFT'}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearAllFilters}
              disabled={activeFiltersCount === 0}
              className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-600/20 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors duration-200 disabled:text-gray-400"
            >
              <X className="h-4 w-4 inline mr-2" />
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-200">
              Showing {onFilteredTickets.length} of {tickets.length} tickets
            </span>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="bg-purple-600/20 text-purple-200 px-2 py-1 rounded-lg text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {paymentStatusFilter !== 'all' && (
                <span className="bg-blue-600/20 text-blue-200 px-2 py-1 rounded-lg text-xs">
                  Status: {paymentStatusFilter}
                </span>
              )}
              {sellerFilter !== 'all' && (
                <span className="bg-green-600/20 text-green-200 px-2 py-1 rounded-lg text-xs">
                  Seller: {sellerFilter}
                </span>
              )}
              {paymentMethodFilter !== 'all' && (
                <span className="bg-orange-600/20 text-orange-200 px-2 py-1 rounded-lg text-xs">
                  Method: {paymentMethodFilter}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

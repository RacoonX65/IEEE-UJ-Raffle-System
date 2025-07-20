'use client'

import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

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

interface AnalyticsDashboardProps {
  tickets: TicketEntry[]
  isOpen: boolean
  onClose: () => void
}

export default function AnalyticsDashboard({ tickets, isOpen, onClose }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all')

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        totalRevenue: 0,
        totalTickets: 0,
        verifiedTickets: 0,
        pendingTickets: 0,
        rejectedTickets: 0,
        cashTickets: 0,
        eftTickets: 0,
        sellerStats: [],
        dailySales: [],
        paymentMethodBreakdown: [],
        verificationRate: 0,
        avgTicketPrice: 50
      }
    }

    const now = new Date()
    const filteredTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.timestamp)
      switch (timeRange) {
        case 'today':
          return ticketDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return ticketDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return ticketDate >= monthAgo
        default:
          return true
      }
    })

    const totalTickets = filteredTickets.length
    const avgTicketPrice = 50 // Default ticket price
    const totalRevenue = totalTickets * avgTicketPrice

    // Payment status breakdown
    const verifiedTickets = filteredTickets.filter(t => 
      t.paymentMethod === 'Cash' || t.paymentStatus === 'VERIFIED'
    ).length
    const pendingTickets = filteredTickets.filter(t => 
      t.paymentMethod !== 'Cash' && (!t.paymentStatus || t.paymentStatus === 'PENDING')
    ).length
    const rejectedTickets = filteredTickets.filter(t => 
      t.paymentStatus === 'REJECTED'
    ).length

    // Payment method breakdown
    const cashTickets = filteredTickets.filter(t => t.paymentMethod === 'Cash').length
    const eftTickets = filteredTickets.filter(t => t.paymentMethod === 'EFT').length

    // Seller statistics
    const sellerMap = new Map<string, { tickets: number; revenue: number; verified: number }>()
    filteredTickets.forEach(ticket => {
      const seller = ticket.seller || 'Unknown'
      const current = sellerMap.get(seller) || { tickets: 0, revenue: 0, verified: 0 }
      current.tickets += 1
      current.revenue += avgTicketPrice
      if (ticket.paymentMethod === 'Cash' || ticket.paymentStatus === 'VERIFIED') {
        current.verified += 1
      }
      sellerMap.set(seller, current)
    })

    const sellerStats = Array.from(sellerMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.tickets - a.tickets)

    // Daily sales trend
    const salesByDate = new Map<string, number>()
    filteredTickets.forEach(ticket => {
      const date = new Date(ticket.timestamp).toDateString()
      salesByDate.set(date, (salesByDate.get(date) || 0) + 1)
    })

    const dailySales = Array.from(salesByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7) // Last 7 days

    // Payment method breakdown for chart
    const paymentMethodBreakdown = [
      { method: 'Cash', count: cashTickets, percentage: totalTickets > 0 ? (cashTickets / totalTickets) * 100 : 0 },
      { method: 'EFT', count: eftTickets, percentage: totalTickets > 0 ? (eftTickets / totalTickets) * 100 : 0 }
    ]

    const verificationRate = totalTickets > 0 ? (verifiedTickets / totalTickets) * 100 : 0

    return {
      totalRevenue,
      totalTickets,
      verifiedTickets,
      pendingTickets,
      rejectedTickets,
      cashTickets,
      eftTickets,
      sellerStats,
      dailySales,
      paymentMethodBreakdown,
      verificationRate,
      avgTicketPrice
    }
  }, [tickets, timeRange])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-purple-400 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
              <p className="text-purple-200 text-sm">IEEE UJ Raffle Sales Insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="today" className="bg-gray-800">Today</option>
              <option value="week" className="bg-gray-800">Last 7 Days</option>
              <option value="month" className="bg-gray-800">Last 30 Days</option>
              <option value="all" className="bg-gray-800">All Time</option>
            </select>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 border border-green-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">R{analytics.totalRevenue.toLocaleString()}</p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl p-4 border border-blue-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Tickets</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalTickets}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Verification Rate</p>
                  <p className="text-2xl font-bold text-white">{analytics.verificationRate.toFixed(1)}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-4 border border-orange-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-medium">Pending Payments</p>
                  <p className="text-2xl font-bold text-white">{analytics.pendingTickets}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Payment Methods
              </h3>
              <div className="space-y-3">
                {analytics.paymentMethodBreakdown.map((item, index) => (
                  <div key={item.method} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        item.method === 'Cash' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-white">{item.method === 'Cash' ? '💵 Cash' : '🏦 EFT'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{item.count} tickets</p>
                      <p className="text-purple-300 text-sm">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Payment Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mr-3" />
                    <span className="text-white">Verified</span>
                  </div>
                  <span className="text-green-400 font-semibold">{analytics.verifiedTickets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-400 mr-3" />
                    <span className="text-white">Pending</span>
                  </div>
                  <span className="text-yellow-400 font-semibold">{analytics.pendingTickets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-400 mr-3" />
                    <span className="text-white">Rejected</span>
                  </div>
                  <span className="text-red-400 font-semibold">{analytics.rejectedTickets}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Sellers */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top Sellers Leaderboard
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-purple-200 text-sm">Rank</th>
                    <th className="text-left py-2 text-purple-200 text-sm">Seller</th>
                    <th className="text-right py-2 text-purple-200 text-sm">Tickets</th>
                    <th className="text-right py-2 text-purple-200 text-sm">Revenue</th>
                    <th className="text-right py-2 text-purple-200 text-sm">Verified</th>
                    <th className="text-right py-2 text-purple-200 text-sm">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.sellerStats.slice(0, 10).map((seller, index) => (
                    <tr key={seller.name} className="border-b border-white/5">
                      <td className="py-3">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-yellow-400 mr-2">🥇</span>}
                          {index === 1 && <span className="text-gray-300 mr-2">🥈</span>}
                          {index === 2 && <span className="text-orange-400 mr-2">🥉</span>}
                          <span className="text-white font-semibold">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 text-white">{seller.name}</td>
                      <td className="py-3 text-right text-white font-semibold">{seller.tickets}</td>
                      <td className="py-3 text-right text-green-400 font-semibold">R{seller.revenue.toLocaleString()}</td>
                      <td className="py-3 text-right text-blue-400">{seller.verified}</td>
                      <td className="py-3 text-right text-purple-300">
                        {seller.tickets > 0 ? ((seller.verified / seller.tickets) * 100).toFixed(0) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Sales Trend */}
          {analytics.dailySales.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Sales Trend (Last 7 Days)
              </h3>
              <div className="flex items-end space-x-2 h-32">
                {analytics.dailySales.map((day, index) => {
                  const maxSales = Math.max(...analytics.dailySales.map(d => d.count))
                  const height = maxSales > 0 ? (day.count / maxSales) * 100 : 0
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg min-h-[4px] transition-all duration-300"
                        style={{ height: `${height}%` }}
                      />
                      <div className="mt-2 text-center">
                        <p className="text-white font-semibold text-sm">{day.count}</p>
                        <p className="text-purple-300 text-xs">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

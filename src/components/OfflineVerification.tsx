'use client'

import { useState, useEffect } from 'react'
import { 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Database,
  RefreshCw
} from 'lucide-react'

interface TicketEntry {
  ticketNumber: string
  name: string
  email: string
  paymentStatus: string
  seller: string
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
}

interface OfflineVerificationProps {
  onVerify: (ticketNumber: string) => void
}

export default function OfflineVerification({ onVerify }: OfflineVerificationProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineTickets, setOfflineTickets] = useState<TicketEntry[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<string[]>([])
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Load offline data from localStorage
    loadOfflineData()
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('ieee-offline-tickets')
      if (stored) {
        setOfflineTickets(JSON.parse(stored))
      }
      
      const pending = localStorage.getItem('ieee-pending-verifications')
      if (pending) {
        setPendingVerifications(JSON.parse(pending))
      }
      
      const sync = localStorage.getItem('ieee-last-sync')
      if (sync) {
        setLastSync(new Date(sync))
      }
    } catch (error) {
      console.error('Error loading offline data:', error)
    }
  }

  const downloadOfflineData = async () => {
    try {
      const response = await fetch('/api/sheets')
      if (response.ok) {
        const data = await response.json()
        const tickets = data.entries || []
        
        // Store in localStorage for offline access
        localStorage.setItem('ieee-offline-tickets', JSON.stringify(tickets))
        localStorage.setItem('ieee-last-sync', new Date().toISOString())
        
        setOfflineTickets(tickets)
        setLastSync(new Date())
        
        alert(`✅ Downloaded ${tickets.length} tickets for offline verification`)
      }
    } catch (error) {
      console.error('Error downloading offline data:', error)
      alert('❌ Failed to download offline data')
    }
  }

  const syncPendingVerifications = async () => {
    if (!isOnline || pendingVerifications.length === 0) return
    
    try {
      const syncPromises = pendingVerifications.map(ticketNumber =>
        fetch('/api/verify-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketNumber,
            method: 'offline-sync',
            verifiedBy: 'offline-mode',
            verifiedAt: new Date().toISOString()
          })
        })
      )
      
      const results = await Promise.all(syncPromises)
      const successful = results.filter(r => r.ok).length
      
      if (successful === pendingVerifications.length) {
        setPendingVerifications([])
        localStorage.removeItem('ieee-pending-verifications')
        alert(`✅ Synced ${successful} offline verifications`)
      } else {
        alert(`⚠️ Synced ${successful}/${pendingVerifications.length} verifications`)
      }
    } catch (error) {
      console.error('Error syncing verifications:', error)
      alert('❌ Failed to sync offline verifications')
    }
  }

  const verifyOffline = (ticketNumber: string) => {
    const ticket = offlineTickets.find(t => t.ticketNumber === ticketNumber)
    
    if (!ticket) {
      alert('❌ Ticket not found in offline database')
      return
    }
    
    if (ticket.verified || pendingVerifications.includes(ticketNumber)) {
      alert('⚠️ Ticket already verified')
      return
    }
    
    if (ticket.paymentStatus !== 'VERIFIED') {
      alert('❌ Payment not verified. Cannot admit entry.')
      return
    }
    
    // Add to pending verifications
    const newPending = [...pendingVerifications, ticketNumber]
    setPendingVerifications(newPending)
    localStorage.setItem('ieee-pending-verifications', JSON.stringify(newPending))
    
    // Update local ticket status
    const updatedTickets = offlineTickets.map(t =>
      t.ticketNumber === ticketNumber
        ? { ...t, verified: true, verifiedAt: new Date().toISOString() }
        : t
    )
    setOfflineTickets(updatedTickets)
    localStorage.setItem('ieee-offline-tickets', JSON.stringify(updatedTickets))
    
    alert(`✅ Ticket ${ticketNumber} verified offline`)
    onVerify(ticketNumber)
  }

  const exportVerificationLog = () => {
    const verifiedTickets = offlineTickets.filter(t => t.verified)
    const csvContent = [
      'Ticket Number,Name,Email,Seller,Verified At',
      ...verifiedTickets.map(t => 
        `${t.ticketNumber},${t.name},${t.email},${t.seller},${t.verifiedAt || ''}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ieee-verification-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Database className="h-6 w-6 mr-2" />
          Offline Verification
        </h3>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
          isOnline 
            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
            : 'bg-red-500/20 text-red-300 border border-red-400/30'
        }`}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Offline Data Status */}
        <div className="bg-black/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Offline Database</span>
            <span className="text-white/70 text-sm">
              {offlineTickets.length} tickets stored
            </span>
          </div>
          
          {lastSync && (
            <p className="text-white/50 text-xs">
              Last sync: {lastSync.toLocaleString()}
            </p>
          )}
        </div>

        {/* Pending Verifications */}
        {pendingVerifications.length > 0 && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 font-medium">Pending Sync</p>
                <p className="text-yellow-200 text-sm">
                  {pendingVerifications.length} offline verifications waiting to sync
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={downloadOfflineData}
            disabled={!isOnline}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Data
          </button>
          
          <button
            onClick={syncPendingVerifications}
            disabled={!isOnline || pendingVerifications.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Sync ({pendingVerifications.length})
          </button>
        </div>

        <button
          onClick={exportVerificationLog}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <Upload className="h-5 w-5 mr-2" />
          Export Verification Log
        </button>

        {/* Offline Verification Instructions */}
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-white font-medium mb-2">Offline Mode Instructions:</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>1. Download latest ticket data before event</li>
            <li>2. Verify tickets normally - they'll be queued</li>
            <li>3. Sync when internet returns</li>
            <li>4. Export logs for backup records</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

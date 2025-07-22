'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Bell, 
  Send, 
  Mail, 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Settings,
  Plus,
  Eye,
  Trash2,
  Filter
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
  ticketPrice?: string // Add optional ticketPrice property
}

interface NotificationTemplate {
  id: string
  name: string
  type: 'email'
  variables: string[]
}

interface NotificationCenterProps {
  tickets: TicketEntry[]
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ tickets, isOpen, onClose }: NotificationCenterProps) {
  // Get current user session data
  const { data: session } = useSession()
  
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history' | 'settings'>('send')
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [recipients, setRecipients] = useState<'all' | 'pending' | 'verified' | 'custom'>('all')
  const [customRecipients, setCustomRecipients] = useState<string>('')
  const [notificationMessage, setNotificationMessage] = useState<string>('')
  const [notificationSubject, setNotificationSubject] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [sendResults, setSendResults] = useState<any>(null)

  // Load notification templates
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/notifications/send')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  // Get recipient list based on selection
  const getRecipientList = () => {
    switch (recipients) {
      case 'all':
        return tickets
      case 'pending':
        return tickets.filter(t => 
          t.paymentMethod !== 'Cash' && 
          (!t.paymentStatus || t.paymentStatus === 'PENDING')
        )
      case 'verified':
        return tickets.filter(t => 
          t.paymentMethod === 'Cash' || t.paymentStatus === 'VERIFIED'
        )
      case 'custom':
        // Parse custom recipients (email or phone numbers)
        const customList = customRecipients.split('\n').filter(line => line.trim())
        return customList.map((contact, index) => ({
          timestamp: '',
          name: `Custom ${index + 1}`,
          email: contact.includes('@') ? contact.trim() : '',
          whatsapp: '', // WhatsApp removed - email-only system
          paymentMethod: '',
          seller: '',
          ticketNumber: '',
        }))
      default:
        return []
    }
  }

  const recipientList = getRecipientList()

  // Send notification
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      alert('Please enter a message')
      return
    }

    setSending(true)
    setSendResults(null)

    try {
      const recipientData = recipientList.map(ticket => ({
        name: ticket.name,
        email: ticket.email,
        // whatsapp: ticket.whatsapp, // WhatsApp removed - email-only system
        ticketNumber: ticket.ticketNumber
      }))

      // Get current user/seller information from session if available
      const currentUser = {
        name: session?.user?.name || 'IEEE UJ Team', // Use session data or fallback
        email: session?.user?.email || 'ieee.uj@gmail.com' // Use session data or fallback
      };
      
      console.log('Current user from session:', session?.user);

      // Define template variables interface to include all possible properties
      interface TemplateVariables {
        
        // Event information
        eventName: string;
        eventDate: string;
        eventLocation: string;
        drawDate: string;
        
        // Ticket information
        ticketPrice: string;
        totalTickets: string;
        prizeName: string;
        
        // Email content
        updateTitle: string;
        updateContent: string;
        
        // Seller information
        sellerName: string;
        sellerEmail: string;
        
        // Payment information
        paymentMethod: string;
        accountHolder: string;
        accountNumber: string;
        bankName: string;
        branchCode: string;
        reference: string;
        
        // Dates
        purchaseDate: string;
        daysSincePurchase: string;
        
        // Optional properties for specific templates
        dueDate?: string;
        confirmationCode?: string;
        [key: string]: string | undefined; // Allow any string property
      }
      
      // Get current date for calculations
      const currentDate = new Date();
      
      // Format dates properly
      const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
      
      // Calculate event and draw dates (use next month's 15th as a default)
      const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);
      
      // Get common variables needed for all templates with real-time data
      const commonVariables: TemplateVariables = {
        // Event information
        eventName: 'IEEE UJ Raffle',
        eventDate: formatDate(eventDate),
        eventLocation: 'University of Johannesburg',
        drawDate: formatDate(eventDate),
        
        // Ticket information
        ticketPrice: '50',
        totalTickets: tickets.length.toString(),
        prizeName: 'IEEE UJ Raffle Prize',
        
        // Email content
        updateTitle: notificationSubject || 'IEEE UJ Raffle Update',
        updateContent: notificationMessage,
        
        // Seller information (current user from session)
        sellerName: currentUser.name,
        sellerEmail: currentUser.email,
        
        // Payment information
        paymentMethod: 'EFT',
        accountHolder: 'MR MQHELOMHLE N MTHUNZI',
        accountNumber: '62042909185',
        bankName: 'First National Bank (FNB)',
        branchCode: '250841',
        reference: 'TICKET-NUMBER',
        
        // Dates - use real dates
        purchaseDate: formatDate(currentDate),
        daysSincePurchase: '3' // Default for bulk notifications
      };
      
      // Add template-specific variables based on selected template
      let templateVariables = {...commonVariables};
      
      if (selectedTemplate === 'payment_reminder') {
        console.log('Adding payment reminder specific variables');
        // Add payment reminder specific variables
        templateVariables = {
          ...templateVariables,
          daysSincePurchase: '3',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        };
      } else if (selectedTemplate === 'ticket_confirmation') {
        console.log('Adding ticket confirmation specific variables');
        // Add ticket confirmation specific variables
        templateVariables = {
          ...templateVariables,
          confirmationCode: 'CONF-' + Math.random().toString(36).substring(2, 8).toUpperCase()
        };
      }
      
      console.log('Sending notification with template variables:', templateVariables);

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedTemplate ? 'custom' : 'bulk',
          data: selectedTemplate ? {
            template: selectedTemplate,
            recipients: recipientData,
            variables: templateVariables
          } : {
            template: 'bulk_update',
            recipients: recipientData,
            variables: templateVariables
          }
        }),
      })

      const result = await response.json()
      setSendResults(result)

      if (result.success) {
        setNotificationMessage('')
        setNotificationSubject('')
        setSelectedTemplate('')
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      setSendResults({
        success: false,
        message: 'Failed to send notification',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setSending(false)
    }
  }

  // Send payment reminders
  const handleSendPaymentReminders = async () => {
    const pendingTickets = tickets.filter(t => 
      t.paymentMethod !== 'Cash' && 
      (!t.paymentStatus || t.paymentStatus === 'PENDING')
    )

    if (pendingTickets.length === 0) {
      alert('No pending payments found')
      return
    }

    setSending(true)

    try {
      const results = []
      for (const ticket of pendingTickets) {
        const daysSince = Math.floor(
          (new Date().getTime() - new Date(ticket.timestamp).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Get seller information from the current user's session
        const sellerName = session?.user?.name || ticket.seller || 'IEEE UJ Team';
        const sellerEmail = session?.user?.email || 'ieee.uj@gmail.com'; // Use logged-in user's email
        
        console.log('Using seller information from session:', { sellerName, sellerEmail });
        
        // Get current date for calculations
        const currentDate = new Date();
        const purchaseDate = new Date(ticket.timestamp);
        const dueDate = new Date(purchaseDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days after purchase
        
        // Format dates properly
        const formatDate = (date: Date): string => {
          return date.toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        };
        
        // Calculate actual ticket price (use real data if available)
        // Using the updated TicketEntry interface that includes ticketPrice
        const ticketPrice = ticket.ticketPrice || '50';
        
        // Create comprehensive payment reminder data with all required variables
        const paymentReminderData = {
          // Buyer information
          buyerName: ticket.name,
          buyerEmail: ticket.email,
          
          // Ticket information
          ticketNumber: ticket.ticketNumber,
          ticketPrice: ticketPrice,
          
          // Seller information - use session data (current logged-in user)
          sellerName: sellerName,
          sellerEmail: sellerEmail,
          
          // Payment information - use real bank details
          paymentMethod: ticket.paymentMethod || 'EFT',
          accountHolder: 'MR MQHELOMHLE N MTHUNZI',
          accountNumber: '62042909185',
          bankName: 'First National Bank (FNB)',
          branchCode: '250841',
          reference: ticket.ticketNumber,
          
          // Dates and timing - use real calculated dates
          daysSincePurchase: daysSince.toString(),
          purchaseDate: formatDate(purchaseDate),
          dueDate: formatDate(dueDate),
          
          // Event information
          eventName: 'IEEE UJ Raffle',
          eventDate: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15)), // Next month's 15th
          eventLocation: 'University of Johannesburg',
          drawDate: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15)), // Same as event date
          
          // Amount information
          amount: ticketPrice,
          amountDue: ticketPrice
        };
        
        console.log(`Sending payment reminder for ticket ${ticket.ticketNumber} with variables:`, paymentReminderData);
        
        const response = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'payment_reminder',
            data: paymentReminderData
          }),
        })

        const result = await response.json()
        results.push(result)
      }

      const successCount = results.filter(r => r.success).length
      setSendResults({
        success: successCount > 0,
        message: `Payment reminders sent: ${successCount}/${pendingTickets.length} successful`,
        totalSent: successCount,
        errors: results.filter(r => !r.success).map(r => r.message)
      })
    } catch (error) {
      console.error('Failed to send payment reminders:', error)
      setSendResults({
        success: false,
        message: 'Failed to send payment reminders',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-purple-400 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">Notification Center</h2>
              <p className="text-purple-200 text-sm">Send notifications and manage communications</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <XCircle className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          {[
            { id: 'send', label: 'Send Notifications', icon: Send },
            { id: 'templates', label: 'Templates', icon: Mail },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-4 font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-purple-400 bg-white/5'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Send Notifications Tab */}
          {activeTab === 'send' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleSendPaymentReminders}
                  disabled={sending}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-2xl text-white font-medium transition-all duration-200 disabled:opacity-50"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Send Payment Reminders
                </button>

                <button
                  onClick={() => {
                    setSelectedTemplate('bulk_update')
                    setNotificationSubject('Important IEEE UJ Raffle Update')
                    setNotificationMessage('We have an important update regarding the IEEE UJ Raffle. Please read the details below and contact us if you have any questions.')
                    setRecipients('all')
                  }}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl text-white font-medium transition-all duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Bulk Update
                </button>

                <button
                  onClick={() => {
                    setSelectedTemplate('winner_announcement')
                    setNotificationSubject('🎉 IEEE UJ Raffle Winner Announcement!')
                    setNotificationMessage('Congratulations! You are the winner of the IEEE UJ Raffle! Please contact us within 7 days to claim your prize.')
                    setRecipients('all')
                  }}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl text-white font-medium transition-all duration-200"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Winner Announcement
                </button>
              </div>

              {/* Recipient Selection */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Select Recipients
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { id: 'all', label: 'All Buyers', count: tickets.length },
                    { id: 'pending', label: 'Pending Payments', count: tickets.filter(t => t.paymentMethod !== 'Cash' && (!t.paymentStatus || t.paymentStatus === 'PENDING')).length },
                    { id: 'verified', label: 'Verified Payments', count: tickets.filter(t => t.paymentMethod === 'Cash' || t.paymentStatus === 'VERIFIED').length },
                    { id: 'custom', label: 'Custom List', count: 0 }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setRecipients(option.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        recipients === option.id
                          ? 'bg-purple-600/20 border-purple-400 text-white'
                          : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-75">{option.count} recipients</div>
                    </button>
                  ))}
                </div>

                {recipients === 'custom' && (
                  <textarea
                    value={customRecipients}
                    onChange={(e) => setCustomRecipients(e.target.value)}
                    placeholder="Enter email addresses or phone numbers (one per line)&#10;example@email.com&#10;+27123456789"
                    className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                )}

                <div className="mt-4 text-sm text-purple-200">
                  Selected: <span className="font-semibold text-white">{recipientList.length}</span> recipients
                </div>
              </div>

              {/* Message Composition */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Compose Message
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={notificationSubject}
                      onChange={(e) => setNotificationSubject(e.target.value)}
                      placeholder="Enter notification subject..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Message
                    </label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="Enter your notification message..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSendNotification}
                    disabled={sending || !notificationMessage.trim()}
                    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Send Results */}
              {sendResults && (
                <div className={`bg-white/5 rounded-2xl p-6 border ${
                  sendResults.success ? 'border-green-400/30' : 'border-red-400/30'
                }`}>
                  <div className="flex items-center mb-4">
                    {sendResults.success ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400 mr-3" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-400 mr-3" />
                    )}
                    <h3 className={`text-lg font-semibold ${
                      sendResults.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {sendResults.success ? 'Success!' : 'Error'}
                    </h3>
                  </div>
                  
                  <p className="text-white mb-2">{sendResults.message}</p>
                  
                  {sendResults.totalSent && (
                    <p className="text-purple-200 text-sm">
                      Total notifications sent: {sendResults.totalSent}
                    </p>
                  )}
                  
                  {sendResults.errors && sendResults.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-red-400 text-sm font-medium mb-2">Errors:</p>
                      <ul className="text-red-300 text-sm space-y-1">
                        {sendResults.errors.map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Notification Templates</h3>
                <button className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">{template.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600/20 text-blue-300">
                          Email
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          // Pre-populate the form with template content
                          const selectedTemplateData = templates.find(t => t.id === template.id)
                          if (selectedTemplateData) {
                            setNotificationSubject(selectedTemplateData.name)
                            // Set a sample message for the template
                            if (template.id === 'ticket_confirmation') {
                              setNotificationMessage('Your ticket confirmation will be sent automatically when you sell tickets.')
                            } else if (template.id === 'payment_reminder') {
                              setNotificationMessage('Payment reminder will be sent to buyers with pending EFT payments.')
                            } else if (template.id === 'winner_announcement') {
                              setNotificationMessage('Congratulations! You are the winner of the IEEE UJ Raffle!')
                            } else if (template.id === 'bulk_update') {
                              setNotificationMessage('Important update about the IEEE UJ Raffle...')
                            } else {
                              setNotificationMessage('Custom notification message...')
                            }
                          }
                          setActiveTab('send')
                        }}
                        className="flex items-center px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-200 text-sm transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Notification History</h3>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <Clock className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200">Notification history will appear here</p>
                <p className="text-purple-300 text-sm mt-2">Feature coming soon...</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Notification Settings</h3>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Email Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        placeholder="587"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Security
                      </label>
                      <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="tls" className="bg-gray-800">TLS</option>
                        <option value="ssl" className="bg-gray-800">SSL</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">WhatsApp Configuration</h4>
                <p className="text-purple-200 text-sm mb-4">
                  WhatsApp notifications are configured via Twilio. Check your environment variables.
                </p>
                
                <div className="flex items-center justify-between p-4 bg-green-600/10 border border-green-400/30 rounded-xl">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
                    <span className="text-green-300">WhatsApp Service Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

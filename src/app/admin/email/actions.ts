'use server'

import { sheetsService } from '@/lib/sheets'

export async function getTicketData() {
  try {
    const data = await sheetsService.getTicketData()
    return {
      success: true,
      data: data.recentEntries
    }
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
    return {
      success: false,
      error: 'Failed to load tickets',
      data: []
    }
  }
}

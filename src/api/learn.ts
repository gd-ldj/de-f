import { SITE_CONFIG } from '@/config/constants'
import type { Locale } from '@/types'

// Learn Item Types
export interface LearnItem {
  id: string
  title: string
  slug: string
  description: string
  content?: string
  firstLetter: string
  createdAt: string
  updatedAt: string
}

export interface LearnItemsResponse {
  items: LearnItem[]
  total: number
}

export interface LearnItemsByLetterResponse {
  [letter: string]: LearnItem[]
}

// Mock data for development
const MOCK_LEARN_ITEMS: LearnItem[] = [
  {
    id: '1',
    title: '51% Attack',
    slug: '51-attack',
    description: 'Also known as a majority attack. When one or a group of miners control greater than 50% of the network\'s mining hashrate or computational power.',
    firstLetter: '#',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Absolute Advantage',
    slug: 'absolute-advantage',
    description: 'Also known as a majority attack. When one or a group of miners control greater than 50% of the network\'s mining hashrate or computational power.',
    firstLetter: 'A',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'B-Tokens',
    slug: 'b-tokens',
    description: 'Also known as a majority attack. When one or a group of miners control greater than 50% of the network\'s mining hashrate or computational power.',
    firstLetter: 'B',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'Candidate Block',
    slug: 'candidate-block',
    description: 'Also known as a majority attack. When one or a group of miners control greater than 50% of the network\'s mining hashrate or computational power.',
    firstLetter: 'C',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    title: 'Dead Cat Bounce',
    slug: 'dead-cat-bounce',
    description: 'Also known as a majority attack. When one or a group of miners control greater than 50% of the network\'s mining hashrate or computational power.',
    firstLetter: 'D',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    title: 'Efficient Market Hypothesis (EMH)',
    slug: 'efficient-market-hypothesis-emh',
    description: 'Also known as a majority attack. When one or a group of miners control greater than 50% of the network\'s mining hashrate or computational power.',
    firstLetter: 'E',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    title: 'Ethereum Foundation',
    slug: 'ethereum-foundation',
    description: 'The Ethereum Foundation is a non-profit organization dedicated to the development, improvement, and promotion of Ethereum and related technologies.',
    content: `
## What Is the Ethereum Foundation

The Ethereum Foundation is a non-profit organization dedicated to the development, improvement, and promotion of Ethereum and related technologies. Established in 2014 with the vision of fostering a decentralized and open-source ecosystem, the Ethereum Foundation plays an important role in supporting the growth of Ethereum and empowering the broader blockchain community.

## Mission and Goals

The primary mission of the Ethereum Foundation is to support Ethereum's evolution and the technologies surrounding it. The foundation strives to support a thriving ecosystem of decentralized applications, enabling a new era of trustless and transparent systems. Additionally, it seeks to educate the public and foster collaboration within the blockchain space.

Unlike a conventional non-profit or controlling entity, the Ethereum Foundation operates as one component within a larger ecosystem. Its purpose is not to dictate the trajectory of Ethereum but to facilitate its organic growth and development.

## Ethereum Foundation Initiatives

As of February 2024, the Ethereum Foundation website presents three main initiatives: Ecosystem Support Program, Devcon, and Fellowship Program.

### 1. Ecosystem Support Program

The Ecosystem Support Program is a flagship initiative designed to provide both financial and non-financial support to projects and entities within the broader Ethereum community. This program, an expansion of the original Ethereum Grants Program, aims to accelerate the growth of the ecosystem. It acts as a catalyst for innovative projects by offering resources and assistance beyond mere financial aid.

### 2. Devcon

The Ecosystem Support Program is a flagship initiative designed to provide both financial and non-financial support to projects and entities within the broader Ethereum community. This program, an expansion of the original Ethereum Grants Program, aims to accelerate the growth of the ecosystem. It acts as a catalyst for innovative projects by offering resources and assistance beyond mere financial aid.
`,
    firstLetter: 'E',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Fetch all learn items
export async function fetchLearnItems(locale: Locale): Promise<LearnItemsResponse> {
  try {
    // In a real application, this would be an API call
    // const response = await fetch(`${SITE_CONFIG.API_BASE_URL}/${locale}/learn`)
    // const data = await response.json()
    
    // For now, return mock data
    return {
      items: MOCK_LEARN_ITEMS,
      total: MOCK_LEARN_ITEMS.length
    }
  } catch (error) {
    console.error('Error fetching learn items:', error)
    return { items: [], total: 0 }
  }
}

// Fetch learn items grouped by first letter
export async function fetchLearnItemsByLetter(locale: Locale): Promise<LearnItemsByLetterResponse> {
  try {
    const { items } = await fetchLearnItems(locale)
    
    // Group items by first letter
    const groupedItems: LearnItemsByLetterResponse = {}
    
    items.forEach(item => {
      const letter = item.firstLetter.toUpperCase()
      if (!groupedItems[letter]) {
        groupedItems[letter] = []
      }
      groupedItems[letter].push(item)
    })
    
    // Sort each group alphabetically
    Object.keys(groupedItems).forEach(letter => {
      groupedItems[letter].sort((a, b) => a.title.localeCompare(b.title))
    })
    
    return groupedItems
  } catch (error) {
    console.error('Error fetching learn items by letter:', error)
    return {}
  }
}

// Fetch a single learn item by slug
export async function fetchLearnItem(locale: Locale, slug: string): Promise<LearnItem | null> {
  try {
    // In a real application, this would be an API call
    // const response = await fetch(`${SITE_CONFIG.API_BASE_URL}/${locale}/learn/${slug}`)
    // const data = await response.json()
    
    // For now, return mock data
    const item = MOCK_LEARN_ITEMS.find(item => item.slug === slug)
    return item || null
  } catch (error) {
    console.error('Error fetching learn item:', error)
    return null
  }
}

// Get all available letters that have learn items
export async function getAvailableLetters(locale: Locale): Promise<string[]> {
  try {
    const groupedItems = await fetchLearnItemsByLetter(locale)
    const letters = Object.keys(groupedItems).sort((a, b) => {
      // Sort with '#' first, then alphabetically
      if (a === '#') return -1
      if (b === '#') return 1
      return a.localeCompare(b)
    })
    
    return letters
  } catch (error) {
    console.error('Error getting available letters:', error)
    return []
  }
}
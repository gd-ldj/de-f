import React, { useState, useEffect } from 'react'

interface LearnSearchProps {
  locale: string
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function LearnSearch({ locale, onSearch, placeholder }: LearnSearchProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    // Auto search after 300ms delay
    setTimeout(() => {
      if (value === query) {
        onSearch?.(value)
      }
    }, 300)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <input 
        type="text" 
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder || 'Search terms here...'} 
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
      <svg 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </form>
  )
}
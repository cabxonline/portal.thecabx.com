"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import { MapPin } from "lucide-react"

export default function CityAutocomplete({
  placeholder,
  value,
  onSelect,
  rideType,
  className = ""
}) {

  const [query, setQuery] = useState(value || "")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  const popularCities = [
    { id: 'p1', name: 'Lucknow', state: 'Uttar Pradesh' },
    { id: 'p2', name: 'Agra', state: 'Uttar Pradesh' },
    { id: 'p3', name: 'Varanasi', state: 'Uttar Pradesh' }
  ]

  useEffect(() => {
    setQuery(value || "")
  }, [value])


  // close dropdown when clicking outside
  useEffect(() => {

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
        setResults([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])


  const searchCities = async (text) => {

    if (!text) {
      setResults([])
      return
    }

    try {

      setLoading(true)

      const data = await api(`/cities?search=${text}&type=${rideType}`)

      setResults(data)

    } catch (err) {
      console.error("City search error:", err)
    } finally {
      setLoading(false)
    }

  }


  const handleChange = (e) => {

    const text = e.target.value

    setQuery(text)

    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      searchCities(text)
    }, 300)

  }


  const selectCity = (city) => {

    setQuery(city.name)
    setResults([])
    setShowSuggestions(false)

    onSelect({
      name: city.name,
      lat: city.lat,
      lon: city.lon
    })

  }


  return (

    <div className="relative w-full" ref={containerRef}>

      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onFocus={() => setShowSuggestions(true)}
        onChange={handleChange}
        className={`w-full outline-none ${className}`} 
      />

      {loading && (
        <div className="absolute right-3 top-3 text-[10px] font-black uppercase text-blue-600 animate-pulse">
          Searching...
        </div>
      )}

      {(results.length > 0 || (showSuggestions && !query)) && (
        <div className="absolute z-[100] bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full md:min-w-[350px] mt-2 max-h-96 overflow-auto animate-in fade-in slide-in-from-top-2 duration-500 custom-scrollbar">
          
          {/* Suggestions Header */}
          {!query && (
             <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Popular Suggestions</p>
             </div>
          )}

          {(query ? results : popularCities).map((city, i) => (
            <div
              key={city.id}
              onClick={() => selectCity(city)}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition hover:bg-blue-50 border-b border-slate-50 last:border-0"
            >
              {/* 📍 Icon */}
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin size={16} />
              </div>

              {/* Text */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {city.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {city.state}
                </span>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>

  )

}
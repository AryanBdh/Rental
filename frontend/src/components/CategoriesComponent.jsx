"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Tag, ChevronLeft, ChevronRight, Camera, Smartphone, Truck, Home, Hammer, Monitor, BookOpen, ShoppingBag, Bed } from "lucide-react";
import toast from 'react-hot-toast'

export function CategoryCards() {
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = { mobile: 1, tablet: 2, desktop: 3 };

  useEffect(() => {
    let mounted = true
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const text = await res.text()
        // if server returned HTML (index.html), warn and show toast
        if (typeof text === 'string' && text.trim().startsWith('<')) {
          console.warn('Categories endpoint returned HTML — backend may be down or proxy not configured')
          toast.error('Failed to load categories: backend not available')
          return
        }
        let data
        try { data = JSON.parse(text) } catch (_) { data = text }
        if (mounted && Array.isArray(data)) setCategories(data)
        else if (mounted && data && Array.isArray(data.categories)) setCategories(data.categories)
      } catch (e) {
        console.warn('Failed to load categories', e)
        toast.error('Failed to load categories')
      }
    }

    fetchCategories()
    return () => { mounted = false }
  }, [])

  const handlePrev = () => setCurrentIndex((i) => Math.max(i - 1, 0))
  const handleNext = () => setCurrentIndex((i) => Math.min(i + 1, Math.max(0, categories.length - itemsPerView.desktop)))
  const visible = categories.slice(currentIndex, currentIndex + itemsPerView.desktop)

  const getIconFor = (label) => {
    if (!label) return Tag
    const name = String(label).toLowerCase()
    if (name.includes('camera') || name.includes('photo')) return Camera
    if (name.includes('phone') || name.includes('mobile') || name.includes('smart')) return Smartphone
    if (name.includes('car') || name.includes('vehicle') || name.includes('bike') || name.includes('bicycle') || name.includes('motor')) return Truck
    if (name.includes('sofa') || name.includes('chair') || name.includes('home') || name.includes('houses')) return Home
    if (name.includes('bed') || name.includes('furn') || name.includes('sleep')) return Bed
    if (name.includes('tool') || name.includes('hammer') || name.includes('drill')) return Hammer
    if (name.includes('electronics') || name.includes('tv') || name.includes('monitor') || name.includes('appliance')) return Monitor
    if (name.includes('book') || name.includes('books') || name.includes('study')) return BookOpen
    if (name.includes('clothe') || name.includes('clothes') || name.includes('fashion')) return ShoppingBag
    // default
    return Tag
  }

  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">Browse by Category</h2>
          <p className="text-center text-muted-foreground leading-relaxed">Find exactly what you need from our diverse range of rental categories</p>
        </div>

        <div className="relative flex items-center gap-4">
          <button onClick={handlePrev} disabled={currentIndex === 0} className="shrink-0 p-2 bg-[#d4af37] text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous category">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
              {visible.map((category) => (
                <Link key={category._id || category.id} to={`/browse?category=${category._id || category.id}`} className="flex flex-col items-center gap-4 p-6 md:p-8 rounded-2xl bg-white border border-border shadow-md hover:shadow-lg transition-shadow text-center">
                  <div className={`w-16 h-16 rounded-xl bg-[#d4af37] flex items-center justify-center shrink-0`}>
                    {(() => {
                      const Icon = getIconFor(category.name || category.title || category.label)
                      return <Icon className="w-8 h-8 text-white" />
                    })()}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground text-center leading-tight">{category.name || category.title}</h3>
                </Link>
              ))}
            </div>
          </div>

          <button onClick={handleNext} disabled={currentIndex >= Math.max(0, categories.length - itemsPerView.desktop)} className="shrink-0 p-2 bg-[#d4af37] text-white rounded-full  transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next category">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.max(1, categories.length - itemsPerView.desktop + 1) }).map((_, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-[#d4af37] w-6" : "bg-border"}`} aria-label={`Go to category slide ${index + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

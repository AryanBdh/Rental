import { Search } from "lucide-react"
import Button from "../components/ui/Button"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#d4af37] to-[#fff2c6] py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Tagline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
          Rent Anything, Anytime
        </h1>
        <p className="text-lg text-blue-100 mb-8 text-balance">
          Discover a wide range of items for rent. Save money, enjoy flexibility, and get what you need on your terms.
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2 p-3">
            <input
              type="text"
              placeholder="What would you like to rent?"
              className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-foreground placeholder-muted-foreground"
            />
            <Button className="bg-[#d4af37] rounded-lg hover:bg-[#b8952e] text-white whitespace-nowrap gap-2">
              <Search size={20} />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </div>

        {/* Suggested Searches */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-blue-100">Popular:</span>
          {["Cars", "Apartments", "Furniture", "Electronics"].map((item) => (
            <button
              key={item}
              className="px-3 py-1 bg-[#d4af37] rounded-full text-white text-sm hover:bg-[#b8952e] transition-colors" 
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
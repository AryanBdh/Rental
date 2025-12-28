export default function Topbar({ title = "Dashboard" }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-[#d4af37] shadow-md hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-[#1a1a1a]">{title}</h2>
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search users, orders..."
          className="hidden sm:inline-block px-3 py-2 rounded bg-[#fff2c6] placeholder-[#8b7a4d] text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:scale-105 transition-all duration-300"
        />
        <div className="w-9 h-9 rounded-full bg-[#d4af37] flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform duration-300 cursor-pointer shadow-md">
          A
        </div>
      </div>
    </header>
  )
}

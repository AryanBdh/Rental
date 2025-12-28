export default function StatsCard({ title, value, delta }) {
  return (
    <div className="bg-white p-4 rounded-lg flex-1 min-w-48 border-l-4 border-[#d4af37] shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
      <div className="text-sm text-[#8b7a4d] font-medium">{title}</div>
      <div className="mt-2 text-2xl font-bold text-[#1a1a1a]">{value}</div>
      {delta && <div className="text-sm text-[#d4af37] mt-1 font-semibold">{delta}</div>}
    </div>
  )
}

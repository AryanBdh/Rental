import { TrendingUp, Wallet, CreditCard } from "lucide-react"

export default function Earnings({
  earnings = { total: 0, pending: 0, transactions: [] },
  earningsLoading,
  formatPrice,
  formatDate,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-[#f5e6d3] p-8">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#f5e6d3]">
          <h2 className="text-2xl font-bold text-[#d4af37]">Earnings Dashboard</h2>
        </div>

        {earningsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-[#f5e6d3] rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#fff2c6] to-[#f5e6d3] rounded-lg p-6 border-2 border-[#d4af37] hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Total Earnings</h3>
                  <TrendingUp className="h-5 w-5 text-[#d4af37]" />
                </div>
                <p className="text-3xl font-bold text-[#d4af37]">{formatPrice(earnings.total)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#fff2c6] to-[#f5e6d3] rounded-lg p-6 border-2 border-[#d4af37] hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Pending Payouts</h3>
                  <Wallet className="h-5 w-5 text-[#d4af37]" />
                </div>
                <p className="text-3xl font-bold text-[#c49a2d]">{formatPrice(earnings.pending)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#fff2c6] to-[#f5e6d3] rounded-lg p-6 border-2 border-[#d4af37] hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Total Transactions</h3>
                  <CreditCard className="h-5 w-5 text-[#d4af37]" />
                </div>
                <p className="text-3xl font-bold text-[#d4af37]">{(earnings.transactions || []).length}</p>
              </div>
            </div>

            {!earningsLoading && (earnings.transactions || []).length > 0 && (
              <div className="bg-[#f5e6d3] rounded-lg p-6 border border-[#d4af37]">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#d4af37]" />
                  Recent Transactions
                </h3>
                <div className="space-y-3">
                  {earnings.transactions.map((t, index) => (
                    <div
                      key={t._id || index}
                      className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{t.title || "Payout"}</h4>
                        <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                      </div>
                      <div className="text-lg font-bold text-[#d4af37]">{formatPrice(t.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

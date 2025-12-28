import React from 'react'

const mockOrders = [
  { id: 101, item: 'Mountain Bike', user: 'Alice', status: 'Returned' },
  { id: 102, item: 'Projector', user: 'Bob', status: 'Active' },
  { id: 103, item: 'Sofa', user: 'Carmen', status: 'Pending' },
]

export default function RecentOrders() {
  return (
    <div className="bg-transparent rounded-lg p-0">
      <h3 className="text-lg font-medium text-slate-900 mb-3">Recent Orders</h3>
      <ul className="space-y-2 text-slate-800">
        {mockOrders.map((o) => (
          <li key={o.id} className="flex items-center justify-between bg-white/2 rounded px-3 py-2">
            <div>
              <div className="font-medium text-slate-900">{o.item}</div>
              <div className="text-sm text-slate-700">Order #{o.id} — {o.user}</div>
            </div>
            <div className={`text-sm px-2 py-1 rounded ${o.status === 'Active' ? 'bg-green-600' : o.status === 'Pending' ? 'bg-yellow-600' : 'bg-slate-600'}`}>
              {o.status}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

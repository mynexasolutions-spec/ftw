import React from 'react'
import { TrendingUp, IndianRupee, ShoppingBag, Clock, ShieldAlert, Sparkles, CreditCard, Box } from 'lucide-react'

export default function DashboardTab({ orders, totalSalesVal, pendingOrders, avgOrderVal }) {
  // Compute advanced metrics
  const customOrders = orders.filter(o => {
    // If o.items is a JSON string or array
    const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
    return items.some(item => item.designId || item.customDesign)
  })

  const customOrdersCount = customOrders.length
  const catalogOrdersCount = orders.length - customOrdersCount

  const customRatio = orders.length > 0 ? Math.round((customOrdersCount / orders.length) * 100) : 0
  const catalogRatio = orders.length > 0 ? 100 - customRatio : 0

  const codOrders = orders.filter(o => o.payment_method?.toUpperCase() === 'COD')
  const codCount = codOrders.length
  const onlineCount = orders.length - codCount
  const codRatio = orders.length > 0 ? Math.round((codCount / orders.length) * 100) : 0
  const onlineRatio = orders.length > 0 ? 100 - codRatio : 0

  const paidOrders = orders.filter(o => o.payment_status?.toLowerCase() === 'paid')
  const unpaidOrdersCount = orders.length - paidOrders.length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <TrendingUp className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Sales Overview
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Track total revenues, average ticket values, paid transactions, and metrics.</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-violet-50/60 to-purple-100/30 hover:to-purple-200/40 border border-purple-100 hover:border-purple-200 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[125px] lg:min-h-[135px] group hover:-translate-y-1">
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans font-black text-purple-700/80 uppercase tracking-widest block">Total Revenue</span>
            <p className="text-lg sm:text-2xl lg:text-2xl xl:text-3xl font-sans font-black text-purple-950 mt-0.5 sm:mt-1 truncate">₹{totalSalesVal.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-purple-600 bg-purple-50/60 px-2 py-0.5 rounded border border-purple-100/50 truncate">All-time paid</span>
            <div className="p-1.5 sm:p-2 lg:p-2 bg-white rounded-xl shadow-sm text-purple-700 shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 lg:w-4 lg:h-4" />
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-blue-50/60 to-indigo-100/30 hover:to-indigo-200/40 border border-blue-100 hover:border-blue-200 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[125px] lg:min-h-[135px] group hover:-translate-y-1">
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans font-black text-blue-700/80 uppercase tracking-widest block">Total Orders</span>
            <p className="text-lg sm:text-2xl lg:text-2xl xl:text-3xl font-sans font-black text-blue-950 mt-0.5 sm:mt-1 truncate">{orders.length}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/50 truncate">Placed orders</span>
            <div className="p-1.5 sm:p-2 lg:p-2 bg-white rounded-xl shadow-sm text-blue-700 shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 lg:w-4 lg:h-4" />
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-gradient-to-br from-amber-50/60 to-orange-100/30 hover:to-orange-200/40 border border-orange-100 hover:border-orange-200 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[125px] lg:min-h-[135px] group hover:-translate-y-1">
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans font-black text-amber-700/80 uppercase tracking-widest block">Pending Orders</span>
            <p className="text-lg sm:text-2xl lg:text-2xl xl:text-3xl font-sans font-black text-amber-950 mt-0.5 sm:mt-1 truncate">{pendingOrders}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-amber-600 bg-amber-50/60 px-2 py-0.5 rounded border border-amber-100/50 truncate">Awaiting dispatch</span>
            <div className="p-1.5 sm:p-2 lg:p-2 bg-white rounded-xl shadow-sm text-amber-700 shrink-0 border border-orange-100 group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 lg:w-4 lg:h-4" />
            </div>
          </div>
        </div>

        {/* AOV Card */}
        <div className="bg-gradient-to-br from-emerald-50/60 to-teal-100/30 hover:to-teal-200/40 border border-teal-100 hover:border-teal-200 p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] sm:min-h-[125px] lg:min-h-[135px] group hover:-translate-y-1">
          <div>
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-sans font-black text-emerald-700/80 uppercase tracking-widest block">Avg Order Value</span>
            <p className="text-lg sm:text-2xl lg:text-2xl xl:text-3xl font-sans font-black text-emerald-950 mt-0.5 sm:mt-1 truncate">₹{avgOrderVal.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex justify-between items-center mt-2 sm:mt-3">
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded border border-teal-100/50 truncate">Per transaction</span>
            <div className="p-1.5 sm:p-2 lg:p-2 bg-white rounded-xl shadow-sm text-emerald-700 shrink-0 border border-teal-100 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 lg:w-4 lg:h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualizer Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Design Style Ratio Visualizer */}
        <div className="bg-white border border-cream3 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-cream2 pb-2.5">
            <h4 className="text-xs lg:text-xs font-sans uppercase text-dark/70 font-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 lg:w-4 lg:h-4 text-accent" />
              Order Matrix (Custom vs Catalog)
            </h4>
            <span className="text-[10px] lg:text-[11px] font-bold text-dark">{orders.length} Total</span>
          </div>

          <div className="space-y-4">
            {/* Progress Bar Visual */}
            <div className="h-4 lg:h-4 bg-cream rounded-full overflow-hidden flex">
              <div className="bg-accent transition-all duration-500" style={{ width: `${customRatio}%` }} title={`Custom Customizer designs: ${customRatio}%`} />
              <div className="bg-dark/80 transition-all duration-500" style={{ width: `${catalogRatio}%` }} title={`Catalog standard prints: ${catalogRatio}%`} />
            </div>

            {/* Details Legends */}
            <div className="grid grid-cols-2 gap-4 text-xs lg:text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 lg:w-2.5 lg:h-2.5 rounded-sm bg-accent inline-block" />
                  <span className="font-bold text-dark">Custom Prints</span>
                </div>
                <p className="text-[10px] lg:text-[11px] text-dark2/60 font-sans">{customOrdersCount} orders ({customRatio}%)</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-bold text-dark">Standard Catalog</span>
                  <span className="w-2.5 h-2.5 lg:w-2.5 lg:h-2.5 rounded-sm bg-dark/80 inline-block" />
                </div>
                <p className="text-[10px] lg:text-[11px] text-dark2/60 font-sans text-right">{catalogOrdersCount} orders ({catalogRatio}%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Splits Visualizer */}
        <div className="bg-white border border-cream3 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-cream2 pb-2.5">
            <h4 className="text-xs lg:text-xs font-sans uppercase text-dark/70 font-black flex items-center gap-2">
              <CreditCard className="w-4 h-4 lg:w-4 lg:h-4 text-accent" />
              Payment Splits (Online vs COD)
            </h4>
            <span className="text-[10px] lg:text-[11px] font-bold text-dark">{onlineCount} Online · {codCount} COD</span>
          </div>

          <div className="space-y-4">
            {/* Progress Bar Visual */}
            <div className="h-4 lg:h-4 bg-cream rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${onlineRatio}%` }} title={`Online prepaid: ${onlineRatio}%`} />
              <div className="bg-amber-500 transition-all duration-500" style={{ width: `${codRatio}%` }} title={`Cash on delivery: ${codRatio}%`} />
            </div>

            {/* Details Legends */}
            <div className="grid grid-cols-2 gap-4 text-xs lg:text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 lg:w-2.5 lg:h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  <span className="font-bold text-dark">Online Prepaid</span>
                </div>
                <p className="text-[10px] lg:text-[11px] text-dark2/60 font-sans">{onlineCount} orders ({onlineRatio}%)</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-bold text-dark">COD (Unpaid)</span>
                  <span className="w-2.5 h-2.5 lg:w-2.5 lg:h-2.5 rounded-sm bg-amber-500 inline-block" />
                </div>
                <p className="text-[10px] lg:text-[11px] text-dark2/60 font-sans text-right">{codCount} orders ({codRatio}%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="font-sans text-xs lg:text-sm uppercase tracking-wider text-dark2/70 font-bold">Recent Transactions</h3>
        <div className="bg-white border border-cream3 rounded-2xl overflow-hidden shadow-sm">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-dark2/50 font-sans text-xs lg:text-sm">
              No recent transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left border-collapse text-xs lg:text-xs font-sans">
                <thead>
                  <tr className="bg-cream/40 border-b border-cream3 text-[10px] lg:text-[11px] uppercase font-bold text-dark2/60 tracking-wider">
                    <th className="p-4 lg:p-4">Customer</th>
                    <th className="p-4 lg:p-4">Transaction ID</th>
                    <th className="p-4 lg:p-4">Date</th>
                    <th className="p-4 lg:p-4">Amount</th>
                    <th className="p-4 lg:p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream3">
                  {orders.slice(0, 5).map(o => {
                    const initials = o.customer_name ? o.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'
                    const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
                    const isCustom = items.some(item => item.designId || item.customDesign)

                    return (
                      <tr key={o.id} className="hover:bg-cream/20 transition-colors group">
                        <td className="p-4 lg:p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 lg:w-8 lg:h-8 rounded-full bg-dark/5 text-dark/80 group-hover:bg-dark group-hover:text-cream flex items-center justify-center font-bold text-xs lg:text-xs uppercase border border-cream3 transition-colors shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-dark block text-xs lg:text-xs">{o.customer_name}</span>
                                {isCustom && (
                                  <span className="bg-purple-50 text-purple-600 border border-purple-100 text-[8px] lg:text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide shrink-0">
                                    Custom Print
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] lg:text-[11px] text-dark2/45 block">{o.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 lg:p-4 font-sans text-dark2/50 text-[10px] lg:text-[11px]" title={o.id}>{o.id}</td>
                        <td className="p-4 lg:p-4 text-dark2/70 text-xs lg:text-xs">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 lg:p-4 font-bold text-dark text-xs lg:text-xs">₹{o.total.toLocaleString('en-IN')}</td>
                        <td className="p-4 lg:p-4">
                          <span className={`text-[9px] lg:text-[10px] uppercase px-2.5 py-1 rounded-full font-bold border ${o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-150' :
                              o.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                                'bg-yellow-50 text-yellow-700 border-yellow-150'
                            }`}>{o.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

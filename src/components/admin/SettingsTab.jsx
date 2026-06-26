import React from 'react'
import { Settings, Truck, CreditCard, IndianRupee, MapPin, Save, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsTab({
  settings,
  setSettings,
  handleSaveSettings
}) {
  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 bg-dark text-white rounded-xl shadow-md">
              <Settings className="w-5.5 h-5.5 text-accent" />
            </div>
            Store Settings
          </h2>
          <p className="text-xs text-dark2/50 mt-1 font-medium">Configure shipping limits, active gateway rails, and company warehouse addresses.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-sans">
        
        {/* Section 1: Logistics & Shipping */}
        <div className="bg-white border border-cream3 p-5 sm:p-6 rounded-3xl space-y-5 hover:border-dark/25 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 border-b border-cream3 pb-3">
            <div className="p-2.5 bg-dark/5 text-dark rounded-xl">
              <Truck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-dark tracking-wider">1. Logistics & Shipping</h3>
              <p className="text-[9px] text-dark2/45 uppercase mt-0.5 font-bold font-mono">Define domestic cargo shipping rates and thresholds</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold block text-dark2/60">Free Shipping Threshold (INR) *</label>
              <input
                type="number" 
                required 
                value={settings.shipping_threshold} 
                onChange={(e) => setSettings({ ...settings, shipping_threshold: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark font-sans text-xs font-bold transition-all"
              />
              <span className="text-[10px] text-dark2/45 block">Orders above <span className="font-extrabold text-dark font-mono">₹{(settings.shipping_threshold || 0).toLocaleString('en-IN')}</span> qualify for free delivery.</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold block text-dark2/60">Flat Shipping Charge (INR) *</label>
              <input
                type="number" 
                required 
                value={settings.shipping_flat_rate} 
                onChange={(e) => setSettings({ ...settings, shipping_flat_rate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark font-sans text-xs font-bold transition-all"
              />
              <span className="text-[10px] text-dark2/45 block">Standard flat delivery fee of <span className="font-extrabold text-dark font-mono">₹{(settings.shipping_flat_rate || 0).toLocaleString('en-IN')}</span>.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Payment Gateways */}
        <div className="bg-white border border-cream3 p-5 sm:p-6 rounded-3xl space-y-5 hover:border-dark/25 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 border-b border-cream3 pb-3">
            <div className="p-2.5 bg-dark/5 text-dark rounded-xl">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-dark tracking-wider">2. Payment Gateways</h3>
              <p className="text-[9px] text-dark2/45 uppercase mt-0.5 font-bold font-mono">Toggle active transaction rails for checkout drop purchases</p>
            </div>
          </div>
          <div className="space-y-3.5">
            <span className="text-[10px] uppercase tracking-wider font-bold block text-dark2/50">Active Checkout Channels</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razorpay Toggle */}
              <button
                type="button"
                onClick={() => setSettings({ ...settings, enable_razorpay: !settings.enable_razorpay })}
                className={`flex items-center justify-between p-4 bg-cream/25 border rounded-2xl hover:shadow-md transition-all duration-300 w-full text-left cursor-pointer group ${
                  settings.enable_razorpay ? 'border-purple-200/80 hover:border-purple-300' : 'border-cream3 hover:border-dark/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    settings.enable_razorpay ? 'bg-purple-100 text-purple-800' : 'bg-dark2/5 text-dark2/45'
                  }`}>
                    <CreditCard className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-dark text-xs block uppercase tracking-wider">Razorpay Gateway</span>
                    <span className="text-[9px] text-dark2/45 uppercase block truncate">UPI, Cards, Netbanking</span>
                  </div>
                </div>
                {/* Toggle Switch */}
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center shrink-0 ${
                  settings.enable_razorpay ? 'bg-purple-600' : 'bg-cream3'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    settings.enable_razorpay ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </button>

              {/* COD Toggle */}
              <button
                type="button"
                onClick={() => setSettings({ ...settings, enable_cod: !settings.enable_cod })}
                className={`flex items-center justify-between p-4 bg-cream/25 border rounded-2xl hover:shadow-md transition-all duration-300 w-full text-left cursor-pointer group ${
                  settings.enable_cod ? 'border-emerald-200/80 hover:border-emerald-300' : 'border-cream3 hover:border-dark/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    settings.enable_cod ? 'bg-emerald-100 text-emerald-800' : 'bg-dark2/5 text-dark2/45'
                  }`}>
                    <IndianRupee className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-dark text-xs block uppercase tracking-wider">Cash on Delivery</span>
                    <span className="text-[9px] text-dark2/45 uppercase block truncate">Pay on package arrival</span>
                  </div>
                </div>
                {/* Toggle Switch */}
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center shrink-0 ${
                  settings.enable_cod ? 'bg-emerald-600' : 'bg-cream3'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    settings.enable_cod ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Company Profile / Warehouse */}
        <div className="bg-white border border-cream3 p-5 sm:p-6 rounded-3xl space-y-5 hover:border-dark/25 hover:shadow-md transition-all duration-300 shadow-sm">
          <div className="flex items-center gap-3 border-b border-cream3 pb-3">
            <div className="p-2.5 bg-dark/5 text-dark rounded-xl">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-dark tracking-wider">3. Warehouse Location</h3>
              <p className="text-[9px] text-dark2/45 uppercase mt-0.5 font-bold font-mono">Origin point for return shipments and dispatch logistics</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold block text-dark2/60">Store Physical Address *</label>
            <input
              type="text" 
              required 
              value={settings.store_address} 
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream/35 border border-cream3 rounded-xl focus:outline-none focus:bg-white focus:border-dark font-sans text-xs font-bold transition-all"
            />
            <span className="text-[10px] text-dark2/45 block">This physical address will be printed on outbound shipping labels.</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-dark text-cream hover:bg-accent hover:text-dark font-sans font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-2 border-none"
          >
            <Save className="w-3.5 h-3.5" /> Save Store Settings
          </motion.button>
        </div>
      </form>
    </div>
  )
}

import React, { useState } from 'react'
import { Users, Search, Mail, Copy, Check, Shield, User, ShoppingBag, Percent } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function UsersTab({
  filteredUsers = [],
  usersList = [],
  searchQuery,
  setSearchQuery,
  orders = []
}) {
  const [copiedUid, setCopiedUid] = useState(null)

  const handleCopyUid = (uid) => {
    navigator.clipboard.writeText(uid)
    setCopiedUid(uid)
    toast.success("User UID copied!")
    setTimeout(() => setCopiedUid(null), 1500)
  }

  // Calculate metrics
  const totalUsers = usersList.length
  const adminCount = usersList.filter(u => u.role === 'Administrator').length
  const customerCount = usersList.filter(u => u.role !== 'Administrator').length
  
  // Active shoppers (users who have at least 1 order)
  const activeShoppersCount = usersList.filter(u => {
    const userOrders = orders.filter(o => o.email?.toLowerCase() === u.email?.toLowerCase())
    return userOrders.length > 0
  }).length

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-dark font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream3 pb-5">
        <div>
          <h2 className="font-sans text-2xl lg:text-3xl font-black uppercase tracking-tight text-dark flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-dark text-white rounded-xl shadow-md">
              <Users className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-accent" />
            </div>
            Customer Accounts
          </h2>
          <p className="text-xs lg:text-sm text-dark2/50 mt-1 font-medium">Manage user profiles, permissions, tracking roles, and user details.</p>
        </div>
        <span className="text-[10px] lg:text-xs bg-dark text-cream font-sans font-bold px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl uppercase tracking-wider shadow-xs">
          {filteredUsers.length === usersList.length
            ? `${usersList.length} Accounts`
            : `Found ${filteredUsers.length} of ${usersList.length}`}
        </span>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Customers */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-violet-50/80 to-purple-100/40 border border-purple-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-purple-700/80 uppercase tracking-widest block">Total Accounts</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-purple-955 mt-0.5 sm:mt-1 font-sans">{totalUsers}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-purple-600 bg-purple-50/90 px-1.5 py-0.5 rounded border border-purple-150/50">Registered</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-purple-700 shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Administrators */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-amber-50/80 to-orange-100/40 border border-orange-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-amber-700/80 uppercase tracking-widest block">Administrators</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-amber-955 mt-0.5 sm:mt-1 font-sans">{adminCount}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-amber-600 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-150/50">Staff access</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-amber-700 shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Customers */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-blue-50/80 to-indigo-100/40 border border-blue-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-blue-700/80 uppercase tracking-widest block">Clients</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-blue-955 mt-0.5 sm:mt-1 font-sans">{customerCount}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-blue-600 bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-150/50">Shop Buyers</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-blue-700 shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
              <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>

        {/* Active Shoppers */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-emerald-550/10 to-teal-100/40 border border-teal-100 p-3 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[100px] sm:min-h-[135px] lg:min-h-[140px] group cursor-pointer"
        >
          <div>
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-[10px] lg:text-xs font-sans font-black text-emerald-700/80 uppercase tracking-widest block">Active Users</span>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-emerald-955 mt-0.5 sm:mt-1 font-sans">{activeShoppersCount}</p>
          </div>
          <div className="flex justify-between items-center mt-1.5 sm:mt-3">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold text-emerald-600 bg-emerald-550/10 px-1.5 py-0.5 rounded border border-teal-150/50">With Orders</span>
            <div className="p-1 sm:p-2 lg:p-2.5 bg-white rounded-xl shadow-xs text-emerald-700 shrink-0 border border-teal-100 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-4.5 lg:h-4.5 text-dark/30 group-focus-within:text-dark transition-colors" />
        <input
          type="text"
          placeholder="Search accounts by name, email, role, or UID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 lg:pl-11 pr-4 py-3 lg:py-3.5 rounded-xl border border-cream3 bg-white hover:border-neutral-355 focus:border-dark focus:bg-white text-xs lg:text-sm text-dark focus:outline-none font-sans font-semibold transition-all shadow-xs placeholder-dark/30"
        />
      </div>

      {/* Users Container */}
      <div className="bg-white border border-cream3 rounded-2xl overflow-hidden shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-dark2/50 font-sans text-xs lg:text-sm flex flex-col items-center justify-center gap-2">
            <Users className="w-8 h-8 text-cream3" />
            <span>{usersList.length === 0 ? 'No registered customer accounts found.' : 'No matching accounts found.'}</span>
          </div>
        ) : (
          <>
            {/* Desktop / Laptop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs lg:text-sm font-sans">
                <thead>
                  <tr className="bg-cream/40 border-b border-cream3 text-[10px] lg:text-xs uppercase font-black text-dark2/50 tracking-wider">
                    <th className="p-4 lg:p-4.5 pl-6">Customer Profile</th>
                    <th className="p-4 lg:p-4.5">UUID Reference</th>
                    <th className="p-4 lg:p-4.5">Purchase History</th>
                    <th className="p-4 lg:p-4.5">Access Role</th>
                    <th className="p-4 lg:p-4.5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream3">
                  {filteredUsers.map((userObj, idx) => {
                    const isAdminRole = userObj.role === 'Administrator'
                    const initials = userObj.name ? userObj.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'
                    
                    const userOrders = orders.filter(o => o.email?.toLowerCase() === userObj.email?.toLowerCase())
                    const orderCount = userOrders.length

                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-cream/20 transition-colors group text-dark font-sans ${
                          isAdminRole ? 'bg-purple-50/10 hover:bg-purple-50/20 border-l-2 border-purple-500' : ''
                        }`}
                      >
                        {/* Profile Info */}
                        <td className="p-4 lg:p-4.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center font-bold text-xs lg:text-sm uppercase border shrink-0 ${
                              isAdminRole ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-dark/5 text-dark border-cream3'
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <span className="font-bold text-dark block text-xs lg:text-sm uppercase">{userObj.name || 'Anonymous User'}</span>
                              <span className="text-[10px] lg:text-[11px] text-dark2/45 font-sans block mt-0.5">{userObj.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* User UUID */}
                        <td className="p-4 lg:p-4.5">
                          <div className="flex items-center gap-1.5 font-sans text-[10px] lg:text-xs text-dark2/40">
                            <span className="truncate max-w-[120px] lg:max-w-[140px]" title={userObj.id}>{userObj.id}</span>
                            <button 
                              onClick={() => handleCopyUid(userObj.id)}
                              className="p-1 hover:text-dark hover:bg-cream border border-transparent hover:border-cream3 rounded transition-all cursor-pointer"
                              title="Copy UID"
                            >
                              {copiedUid === userObj.id ? <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-600" /> : <Copy className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Order History Count */}
                        <td className="p-4 lg:p-4.5">
                          {orderCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-150 text-[9px] lg:text-[10px] font-black uppercase rounded-lg">
                              <ShoppingBag className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> {orderCount} Order{orderCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-dark2/35 text-[9px] lg:text-xs font-sans">No purchases</span>
                          )}
                        </td>

                        {/* Access Role Badge */}
                        <td className="p-4 lg:p-4.5">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] lg:text-[10px] font-black uppercase border tracking-wider ${
                            isAdminRole
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-cream2 text-dark2/75 border-cream3'
                          }`}>
                            {userObj.role}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 lg:p-4.5 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`mailto:${userObj.email}?subject=For%20The%20Win%20Support`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-dark text-cream hover:bg-accent hover:text-dark rounded-xl text-[9px] lg:text-xs font-sans font-black uppercase tracking-wider transition-colors shadow-xs border-none"
                              title="Mail Customer"
                            >
                              <Mail className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Email
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden divide-y divide-cream3 bg-cream2/10">
              {filteredUsers.map((userObj, idx) => {
                const isAdminRole = userObj.role === 'Administrator'
                const initials = userObj.name ? userObj.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'
                
                const userOrders = orders.filter(o => o.email?.toLowerCase() === userObj.email?.toLowerCase())
                const orderCount = userOrders.length

                return (
                  <div 
                    key={idx} 
                    className={`p-4 sm:p-5 space-y-4 hover:bg-cream/15 transition-all text-dark font-sans ${
                      isAdminRole ? 'border-l-4 border-purple-500' : ''
                    }`}
                  >
                    {/* Customer Header */}
                    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase border shrink-0 ${
                          isAdminRole ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-dark/5 text-dark border-cream3'
                        }`}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-extrabold text-dark text-xs uppercase block" title={userObj.name}>{userObj.name || 'Anonymous User'}</span>
                          <span className="text-[9.5px] text-dark2/45 font-sans block truncate" title={userObj.email}>{userObj.email}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase border tracking-wider shrink-0 ${
                        isAdminRole
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-cream2 text-dark2/75 border-cream3'
                      }`}>
                        {userObj.role}
                      </span>
                    </div>

                    {/* Metadata Card */}
                    <div className="grid grid-cols-2 gap-3 bg-white border border-cream3 p-3 rounded-xl shadow-xs text-[10px]">
                      <div>
                        <span className="text-[8px] uppercase font-black text-dark2/45 block mb-0.5">UUID Reference</span>
                        <div className="flex items-center gap-1 font-sans text-[9px] text-dark2/60">
                          <span className="truncate max-w-[80px]" title={userObj.id}>{userObj.id}</span>
                          <button 
                            onClick={() => handleCopyUid(userObj.id)}
                            className="p-0.5 hover:text-dark transition-all cursor-pointer border-none bg-transparent"
                          >
                            {copiedUid === userObj.id ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="border-l border-cream3/50 pl-3">
                        <span className="text-[8px] uppercase font-black text-dark2/45 block mb-0.5">Purchases</span>
                        {orderCount > 0 ? (
                          <span className="font-bold text-blue-700">{orderCount} Order{orderCount > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-dark2/40 font-sans">None</span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end pt-1">
                      <a
                        href={`mailto:${userObj.email}?subject=For%20The%20Win%20Support`}
                        className="py-2 px-4 bg-dark text-cream hover:bg-accent hover:text-dark rounded-xl text-[10px] font-sans font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-xs border-none cursor-pointer"
                        title="Mail Customer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Client</span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

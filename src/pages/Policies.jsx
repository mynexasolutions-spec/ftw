import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, Truck, RotateCcw, CreditCard, FileText, ArrowRight, CheckCircle2, XCircle, Zap, Banknote, QrCode, Landmark } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { key: 'return',   label: 'Returns',   icon: RotateCcw },
  { key: 'exchange', label: 'Exchanges', icon: ShieldCheck },
  { key: 'shipping', label: 'Shipping',  icon: Truck },
  { key: 'payment',  label: 'Payment',   icon: CreditCard },
  { key: 'terms',    label: 'Terms',     icon: FileText },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.215, 0.61, 0.355, 1] } },
  exit:   { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

function Tag({ children, green }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest border select-none ${
      green
        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    }`}>
      {children}
    </span>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-purple-500/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="w-9 h-9 rounded-xl bg-purple-500/10 group-hover:bg-purple-600 flex items-center justify-center mb-1 transition-colors duration-300">
        <Icon className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#161616]/50">{label}</span>
      <span className="text-sm sm:text-base font-bold text-[#161616] leading-snug uppercase tracking-wide">{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs lg:text-[13px] font-mono font-black uppercase tracking-[0.22em] text-[#161616]/60 flex items-center gap-2">
        <span className="w-4 h-px bg-purple-600" />
        {title}
      </h3>
      <div className="text-sm sm:text-base lg:text-[17px] text-neutral-600 leading-relaxed font-sans">
        {children}
      </div>
    </div>
  )
}

function CheckList({ items, good = true }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base lg:text-[17px] text-neutral-600">
          {good
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          }
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}


export default function Policies() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'return'

  const setTab = (tab) => setSearchParams({ tab })

  const activeTabData = TABS.find(t => t.key === activeTab)

  return (
    <div className="bg-[#FAF9F6] text-[#161616] font-sans min-h-screen pt-8 sm:pt-16 pb-20 relative overflow-hidden selection:bg-[#161616] selection:text-white bg-grain">
      
      {/* Gaming UI styles matching Helpline and Blogs */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grain {
            background-image: 
              radial-gradient(rgba(139, 92, 246, 0.08) 1.2px, transparent 1.2px),
              radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%);
            background-size: 20px 20px, 100% 100%, 100% 100%;
          }

          /* Full subtle scanline overlay */
          .policies-scanlines {
            position: absolute; inset: 0; z-index: 1; pointer-events: none;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139,92,246,0.02) 2px,
              rgba(139,92,246,0.02) 4px
            );
          }

          .hud-policies-title {
            font-family: 'Orbitron', 'Space Grotesk', sans-serif;
            font-weight: 1000;
            font-size: clamp(34px, 5.5vw, 64px);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            line-height: 1.1;
            color: #161616;
          }

          .hud-policies-title span {
            background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-style: italic;
          }

          /* Outer border wrapper matching other HUD containers */
          .hud-card-border {
            background: linear-gradient(135deg, rgba(168,85,247,0.8), rgba(99,58,214,0.6), rgba(37,99,235,0.6));
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
            padding: 1.5px;
            position: relative;
            transition: all 0.3s ease;
          }

          /* HUD Card layout */
          .hud-policies-card {
            background: #FFFFFF;
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
          }

          /* HUD corner ticks */
          .hud-corner { position: absolute; width: 14px; height: 14px; border-color: rgba(139,92,246,0.5); border-style: solid; z-index: 10; }
          .hud-tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
          .hud-tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
          .hud-bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
          .hud-br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }

          .hud-hex { position: absolute; font-size: 7px; font-family: monospace; color: rgba(139,92,246,0.45); letter-spacing: 0.05em; font-weight: bold; z-index: 10; }
          .hud-hex-tl { top: 4px; left: 24px; }
          .hud-hex-tr { top: 4px; right: 24px; }
        `
      }} />

      <div className="policies-scanlines" />

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Title Header with Gaming HUD layout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 text-left border-b border-[#E8E5DC] pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-600 font-mono uppercase tracking-[0.25em] text-[10px] font-black rounded mb-4">
            <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" /> FTW_SYSTEM_DOCS
          </div>
          <h1 className="hud-policies-title">
            STORE <span>POLICIES</span>
          </h1>
          <p className="text-dark2/50 font-mono text-[11px] md:text-sm font-bold uppercase tracking-wider mt-2">
            EVERYTHING YOU NEED TO KNOW ABOUT SHIPPING, REFUNDS & COMPLIANCE.
          </p>
        </motion.div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sidebar Tabs ── */}
          <nav className="w-full lg:w-60 shrink-0 lg:sticky lg:top-6 z-20">
            <p className="text-xs lg:text-sm font-mono font-black uppercase tracking-[0.25em] text-[#161616]/50 mb-3 pl-1 hidden lg:block">Jump to section</p>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1 no-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTab(tab.key)}
                    className={`relative flex items-center gap-2.5 lg:gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 cursor-pointer shrink-0 lg:shrink lg:w-full border ${
                      isActive
                        ? 'bg-[#161616] border-[#161616] text-[#D6FF40] shadow-md'
                        : 'bg-white border-purple-500/10 text-neutral-500 hover:text-[#161616] hover:border-purple-500/20 hover:bg-neutral-50 shadow-xs'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/10' : 'bg-purple-500/10'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#D6FF40]' : 'text-purple-600'}`} />
                    </div>
                    <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider whitespace-nowrap">{tab.label}</span>
                    {isActive && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#D6FF40] ml-auto hidden lg:block" />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* ── Content Panel ── */}
          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="hud-card-border"
              >
                <div className="hud-policies-card">
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />


                  {/* Panel Header */}
                  <div className="bg-[#161616] px-5 sm:px-8 py-5 flex items-center gap-3 sm:gap-4 border-b border-purple-500/10">
                    {activeTabData && (
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        {(() => { const Icon = activeTabData.icon; return <Icon className="w-4.5 h-4.5 text-[#D6FF40]" /> })()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.25em] text-[#D6FF40]/60 mb-0.5">FOR THE WIN // COMPLIANCE</p>
                      <h2 className="text-base sm:text-xl font-mono font-black uppercase text-white tracking-tight truncate">
                        {activeTabData?.label} POLICY
                      </h2>
                    </div>
                    <div className="ml-auto shrink-0">
                      <Tag green>{activeTab === 'return' || activeTab === 'exchange' ? '4-5 Day Window' : activeTab === 'shipping' ? 'Pan India Dispatch' : activeTab === 'payment' ? 'Secure Gateway' : 'Terms Active'}</Tag>
                    </div>
                  </div>

                  {/* Panel Body */}
                  <div className="p-4 sm:p-8 md:p-10 space-y-8 sm:space-y-10">

                    {/* ── RETURN ── */}
                    {activeTab === 'return' && (<>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <InfoCard icon={RotateCcw} label="Return Window" value="Within 4-5 days of delivery" />
                        <InfoCard icon={CheckCircle2} label="Refund Timeline" value="4–5 business days" />
                        <InfoCard icon={XCircle} label="DTF Products" value="Non-returnable" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <Section title="Eligibility Period">
                          Returns are accepted within <strong>4-5 days</strong> of delivery. Requests made after this window will not be processed under any circumstance.
                        </Section>
                        <Section title="Return Conditions">
                          <CheckList items={[
                            'Product must be entirely unused and unworn.',
                            'Original brand tags must remain attached.',
                            'Must be in original packaging.',
                          ]} />
                        </Section>
                        <Section title="Non-Returnable Items">
                          <CheckList good={false} items={[
                            'Customized DTF products cannot be returned.',
                            'Products damaged due to customer misuse.',
                            'Items returned after the 4-5 days window.',
                          ]} />
                        </Section>
                        <Section title="Refund Timeline">
                          Refunds are credited to the original payment source within <strong>4–5 business days</strong> after the returned item passes inspection.
                        </Section>
                      </div>
                    </>)}

                    {/* ── EXCHANGE ── */}
                    {activeTab === 'exchange' && (<>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <InfoCard icon={ShieldCheck}  label="Exchange Window" value="Within 4-5 days of delivery" />
                        <InfoCard icon={Truck}        label="Pickup"          value="Reverse pickup arranged" />
                        <InfoCard icon={CheckCircle2} label="Condition"       value="Unworn, tags intact" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <Section title="Size Exchanges">
                          Size exchanges are allowed within <strong>4-5 days</strong> of delivery — subject to stock availability of the requested size.
                        </Section>
                        <Section title="Exchange Conditions">
                          <CheckList items={[
                            'Product must be completely unworn.',
                            'All original tags must be intact.',
                            'Item must be clean and undamaged.',
                          ]} />
                        </Section>
                        <Section title="How it Works">
                          <ol className="space-y-3.5 mt-2">
                            {[
                              'Submit a request via helpline email or WhatsApp.',
                              'We arrange a reverse pickup from your address.',
                              'In exchange / replacement, product will be delivered in 4-5 days.',
                            ].map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm sm:text-base lg:text-[17px] text-neutral-600">
                                <span className="w-6 h-6 rounded-xl bg-[#161616] text-[#D6FF40] text-[10px] font-mono font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <span className="pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </Section>
                      </div>
                    </>)}

                    {/* ── SHIPPING ── */}
                    {activeTab === 'shipping' && (<>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <InfoCard icon={Truck}        label="Processing"  value="1–3 business days" />
                        <InfoCard icon={ArrowRight}   label="Delivery"    value="3–7 business days" />
                        <InfoCard icon={CheckCircle2} label="Coverage"    value="Pan India — Insured" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <Section title="Processing Time">
                          All orders are verified, packed, and dispatched within <strong>1–3 business days</strong> of order confirmation.
                        </Section>
                        <Section title="Delivery Time">
                          Shipments generally arrive within <strong>3–7 business days</strong> after dispatch, depending on your location.
                        </Section>
                        <Section title="Coverage">
                          We ship across <strong>Pan India</strong>. All shipments are fully insured against loss or transit damage.
                        </Section>
                        <Section title="Order Tracking">
                          Real-time tracking details are shared via email and SMS as soon as your package leaves our facility.
                        </Section>
                      </div>
                    </>)}

                    {/* ── PAYMENT ── */}
                    {activeTab === 'payment' && (<>
                      <Section title="Online Payments">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          {[
                            { name: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay & Amex cards accepted.' },
                            { name: 'UPI Instant Pay', icon: QrCode, desc: 'Google Pay, PhonePe, Paytm, BHIM & all major UPI apps.' },
                            { name: 'Net Banking', icon: Landmark, desc: 'Secure direct login with over 50+ major Indian banks.' }
                          ].map(m => {
                            const Icon = m.icon
                            return (
                              <div key={m.name} className="bg-white border border-purple-500/10 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/25 transition-all duration-200">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                  <Icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-left">
                                  <span className="text-sm font-mono font-black uppercase tracking-wider text-[#161616] block">{m.name}</span>
                                  <span className="text-xs md:text-[13px] text-neutral-500 font-sans block mt-0.5">{m.desc}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </Section>

                      <Section title="Cash on Delivery">
                        <div className="mt-3 bg-[#161616] rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300">
                          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Banknote className="w-5 h-5 text-[#D6FF40]" />
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-mono font-black uppercase tracking-wider text-[#D6FF40] block">Cash on Delivery (COD) — Available</span>
                            <span className="text-xs md:text-[13px] text-white/60 font-sans block mt-0.5">Pay in cash or digital scan-on-delivery when your parcel arrives.</span>
                          </div>
                        </div>
                      </Section>
                    </>)}

                    {/* ── TERMS ── */}
                    {activeTab === 'terms' && (<>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <InfoCard icon={FileText}     label="Effective"    value="Immediate — upon purchase" />
                        <InfoCard icon={ShieldCheck}  label="Data Policy"  value="Never sold to third parties" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <Section title="Terms of Service">
                          By browsing or purchasing from FOR THE WIN, you agree to comply with our user agreement. All designs are copy-protected intellectual properties of FTW.
                        </Section>
                        <Section title="Data Privacy">
                          Your details (name, address, email, phone) are processed securely to complete transactions. We <strong>never</strong> sell user data to third-party advertisers.
                        </Section>
                        <Section title="Intellectual Property">
                          <CheckList items={[
                            'All artwork and branding is owned by For The Win.',
                            'Reproduction without written permission is prohibited.',
                            'Customer uploads for DTF remain their own property.',
                          ]} />
                        </Section>
                        <Section title="Governing Law">
                          These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in the relevant state.
                        </Section>
                      </div>
                    </>)}

                  </div>

                  {/* Panel Footer */}
                  <div className="border-t border-purple-500/10 px-5 sm:px-8 py-4 flex items-center justify-between bg-neutral-50 gap-2">
                    <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-[0.22em] text-[#161616]/30">For The Win — System Agreements</span>
                    <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-widest text-[#161616]/30 shrink-0">2026</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}

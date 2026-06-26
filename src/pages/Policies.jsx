import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, Truck, RotateCcw, CreditCard, FileText, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { key: 'return',   label: 'Returns',   icon: RotateCcw,    color: '#FF4E20' },
  { key: 'exchange', label: 'Exchanges', icon: ShieldCheck,  color: '#CCFF00' },
  { key: 'shipping', label: 'Shipping',  icon: Truck,        color: '#CCFF00' },
  { key: 'payment',  label: 'Payment',   icon: CreditCard,   color: '#FF4E20' },
  { key: 'terms',    label: 'Terms',     icon: FileText,     color: '#CCFF00' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
  exit:   { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

function Tag({ children, green }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
      green
        ? 'bg-[#CCFF00]/10 text-[#4a5a00] border-[#CCFF00]/30'
        : 'bg-[#FF4E20]/10 text-[#c43010] border-[#FF4E20]/20'
    }`}>
      {children}
    </span>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-cream3 rounded-2xl p-5 flex flex-col gap-2 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
      <div className="w-9 h-9 rounded-xl bg-cream2 flex items-center justify-center mb-1">
        <Icon className="w-4 h-4 text-[#FF4E20]" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-dark/40">{label}</span>
      <span className="text-sm font-black text-dark leading-snug">{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-dark/40 flex items-center gap-2">
        <span className="w-4 h-px bg-[#FF4E20]" />
        {title}
      </h3>
      <div className="text-sm text-dark2/75 leading-relaxed">
        {children}
      </div>
    </div>
  )
}

function CheckList({ items, good = true }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-dark2/75">
          {good
            ? <CheckCircle2 className="w-4 h-4 text-[#4a8a00] shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 text-[#c43010] shrink-0 mt-0.5" />
          }
          {item}
        </li>
      ))}
    </ul>
  )
}

function PayBadge({ label }) {
  return (
    <div className="bg-white border border-cream3 rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-sm hover:border-dark/20 hover:shadow-card-hover transition-all duration-200 cursor-default">
      <span className="w-2 h-2 rounded-full bg-[#CCFF00] border border-[#b0e000]" />
      <span className="text-xs font-black uppercase tracking-wider text-dark">{label}</span>
    </div>
  )
}

export default function Policies() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'return'

  const setTab = (tab) => setSearchParams({ tab })

  const activeTabData = TABS.find(t => t.key === activeTab)

  return (
    <div className="bg-cream2 text-dark font-sans min-h-screen selection:bg-[#CCFF00] selection:text-dark">

      {/* ── Hero Banner ── */}
      <section className="relative bg-white border-b border-cream3">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-cream2 border border-cream3 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E20]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-dark/50">Store Documentation</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-dark leading-none mb-3">
              Store Policies
            </h1>
            <p className="text-dark/45 text-sm max-w-md leading-relaxed">
              Everything you need to know about returns, exchanges, shipping, and more — transparent and straightforward.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Sidebar Tabs ── */}
          <nav className="w-full lg:w-56 shrink-0 lg:sticky lg:top-6">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-dark/35 mb-3 pl-1 hidden lg:block">Jump to section</p>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1 no-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTab(tab.key)}
                    className={`relative flex items-center gap-2 lg:gap-3 px-3 py-2.5 lg:px-4 lg:py-3.5 rounded-xl lg:rounded-2xl text-left transition-all duration-300 cursor-pointer shrink-0 lg:shrink lg:w-full border ${
                      isActive
                        ? 'bg-dark border-dark text-white shadow-lg'
                        : 'bg-white border-cream3 text-dark/60 hover:text-dark hover:border-dark/20 hover:bg-cream shadow-sm'
                    }`}
                  >
                    <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/10' : 'bg-cream2'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isActive ? 'text-[#CCFF00]' : 'text-dark/50'}`} />
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider whitespace-nowrap lg:whitespace-normal">{tab.label}</span>
                    {isActive && (
                      <ArrowRight className="w-3 h-3 text-[#CCFF00] ml-auto hidden lg:block" />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* ── Content Panel ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white border border-cream3 rounded-3xl shadow-card overflow-hidden"
              >
                {/* Panel Header */}
                <div className="bg-dark px-5 sm:px-8 py-4 sm:py-6 flex items-center gap-3 sm:gap-4">
                  {activeTabData && (
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      {(() => { const Icon = activeTabData.icon; return <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#CCFF00]" /> })()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/35 mb-0.5">For The Win</p>
                    <h2 className="text-base sm:text-xl font-black uppercase text-white tracking-tight truncate">
                      {activeTabData?.label}
                    </h2>
                  </div>
                  <div className="ml-auto shrink-0">
                    <Tag green>{activeTab === 'return' || activeTab === 'exchange' ? '7-Day' : activeTab === 'shipping' ? 'Pan India' : activeTab === 'payment' ? 'Secure' : 'Active'}</Tag>
                  </div>
                </div>

                {/* Panel Body */}
                <div className="p-4 sm:p-7 md:p-10 space-y-7 sm:space-y-10">

                  {/* ── RETURN ── */}
                  {activeTab === 'return' && (<>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <InfoCard icon={RotateCcw} label="Return Window" value="Within 7 days of delivery" />
                      <InfoCard icon={CheckCircle2} label="Refund Timeline" value="5–7 business days" />
                      <InfoCard icon={XCircle} label="DTF Products" value="Non-returnable" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                      <Section title="Eligibility Period">
                        Returns are accepted within <strong>7 days</strong> of delivery. Requests made after this window will not be processed under any circumstance.
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
                          'Items returned after the 7-day window.',
                        ]} />
                      </Section>
                      <Section title="Refund Timeline">
                        Refunds are credited to the original payment source within <strong>5–7 business days</strong> after the returned item passes inspection.
                      </Section>
                    </div>
                  </>)}

                  {/* ── EXCHANGE ── */}
                  {activeTab === 'exchange' && (<>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <InfoCard icon={ShieldCheck}  label="Exchange Window" value="Within 7 days of delivery" />
                      <InfoCard icon={Truck}        label="Pickup"          value="Reverse pickup arranged" />
                      <InfoCard icon={CheckCircle2} label="Condition"       value="Unworn, tags intact" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Section title="Size Exchanges">
                        Size exchanges are allowed within <strong>7 days</strong> of delivery — subject to stock availability of the requested size.
                      </Section>
                      <Section title="Exchange Conditions">
                        <CheckList items={[
                          'Product must be completely unworn.',
                          'All original tags must be intact.',
                          'Item must be clean and undamaged.',
                        ]} />
                      </Section>
                      <Section title="How it Works">
                        <ol className="space-y-3 mt-2">
                          {[
                            'Submit a request via helpline email or WhatsApp.',
                            'We arrange a reverse pickup from your address.',
                            'Replacement is dispatched once item is received.',
                          ].map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-dark2/75">
                              <span className="w-6 h-6 rounded-full bg-dark text-[#CCFF00] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </Section>
                    </div>
                  </>)}

                  {/* ── SHIPPING ── */}
                  {activeTab === 'shipping' && (<>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <InfoCard icon={Truck}        label="Processing"  value="1–3 business days" />
                      <InfoCard icon={ArrowRight}   label="Delivery"    value="3–7 business days" />
                      <InfoCard icon={CheckCircle2} label="Coverage"    value="Pan India — Insured" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        {['Credit Card', 'Debit Card', 'UPI', 'Net Banking'].map(m => (
                          <PayBadge key={m} label={m} />
                        ))}
                      </div>
                    </Section>

                    <Section title="Cash on Delivery">
                      <div className="mt-3 bg-dark rounded-2xl px-6 py-5 flex items-center gap-4">
                        <span className="w-3 h-3 rounded-full bg-[#CCFF00]" />
                        <span className="text-sm font-black uppercase tracking-wider text-white">Cash on Delivery (COD) — Available</span>
                      </div>
                    </Section>

                    <Section title="Partial Payment Option">
                      <div className="mt-3 bg-cream2 border border-cream3 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#4a8a00] shrink-0" />
                          <span className="text-sm text-dark2/75">Pay a percentage upfront online.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#4a8a00] shrink-0" />
                          <span className="text-sm text-dark2/75">Remaining amount payable on delivery.</span>
                        </div>
                      </div>
                    </Section>
                  </>)}

                  {/* ── TERMS ── */}
                  {activeTab === 'terms' && (<>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <InfoCard icon={FileText}     label="Effective"    value="Immediate — upon purchase" />
                      <InfoCard icon={ShieldCheck}  label="Data Policy"  value="Never sold to third parties" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="border-t border-cream3 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between bg-cream2 gap-2">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.22em] text-dark/30">For The Win — Agreements</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-dark/30 shrink-0">2025</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>
    </div>
  )
}

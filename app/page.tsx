import Link from "next/link"
import Image from "next/image"
import { GradientButton } from "@/components/ui/gradient-button"
import { Shield, Zap, RefreshCw, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section с ирисовым раскатом и гильошем */}
      <section className="relative py-20 px-4 overflow-hidden bg-white">
        {/* Гильош (декоративный узор) */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="guilloche" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="#0155FF" strokeWidth="1" />
                <path d="M0,30 Q25,80 50,30 T100,30" fill="none" stroke="#00DB49" strokeWidth="1" />
                <path d="M0,70 Q25,20 50,70 T100,70" fill="none" stroke="#0155FF" strokeWidth="1" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#00DB49" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#0155FF" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#00DB49" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#guilloche)" />
          </svg>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#0155FF]">
              SALTA: Secure, Automated, Liquidity. Transparency Always
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-gray-700 max-w-3xl mx-auto">
              Instant & Secure OTC Crypto Exchanges via Smart Contracts
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Trade stablecoins with fiat currency through our automated platform. No intermediaries, no risks - your
              funds are secured by smart contracts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton asChild size="lg" className="px-8">
                <Link href="/register">Register Your Company</Link>
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white" id="features">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our OTC Exchange?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers significant advantages over traditional P2P exchanges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-[#0155FF]/10">
                <Shield className="h-6 w-6 text-[#0155FF]/50" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Escrow</h3>
              <p className="text-gray-600">
                Your stablecoins are locked in a decentralized smart contract. No one, except the participants, can
                access these funds.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-[#0155FF]/10">
                <Zap className="h-6 w-6 text-[#0155FF]/50" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automated Process</h3>
              <p className="text-gray-600">
                No manual confirmations needed. The system automatically handles the transfer once payment is verified.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-[#0155FF]/10">
                <RefreshCw className="h-6 w-6 text-[#0155FF]/50" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Transactions</h3>
              <p className="text-gray-600">
                All conditions are recorded on the blockchain and cannot be changed by either party. Complete
                transaction history is visible.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-[#0155FF]/10">
                <Clock className="h-6 w-6 text-[#0155FF]/50" />
              </div>
              <h3 className="text-xl font-bold mb-3">Time Efficiency</h3>
              <p className="text-gray-600">
                Current OTC platforms complete deals in 6 hours on average. We can reduce this time to just 2 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50 relative overflow-hidden" id="how-it-works">
        {/* Гильош (декоративный узор) */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="guilloche2" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="#0155FF" strokeWidth="1" />
                <path d="M0,30 Q25,80 50,30 T100,30" fill="none" stroke="#00DB49" strokeWidth="1" />
                <path d="M0,70 Q25,20 50,70 T100,70" fill="none" stroke="#0155FF" strokeWidth="1" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#00DB49" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#0155FF" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#00DB49" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#guilloche2)" />
          </svg>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our OTC exchange simplifies the process of trading stablecoins for fiat currency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <ol className="relative border-l border-[#0155FF]/30 ml-3">
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-white">
                    <span className="text-[#0155FF] font-bold">1</span>
                  </span>
                  <h3 className="text-lg font-semibold mb-1">Register Your Company</h3>
                  <p className="text-gray-600">
                    Complete our simple registration process to verify your company's identity and gain access to the
                    platform.
                  </p>
                </li>
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-white">
                    <span className="text-[#0155FF] font-bold">2</span>
                  </span>
                  <h3 className="text-lg font-semibold mb-1">Create an Order</h3>
                  <p className="text-gray-600">
                    Specify the stablecoin, amount, and payment method for your trade. Our system will automatically
                    match you with counterparties.
                  </p>
                </li>
                <li className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-white">
                    <span className="text-[#0155FF] font-bold">3</span>
                  </span>
                  <h3 className="text-lg font-semibold mb-1">Secure Escrow Process</h3>
                  <p className="text-gray-600">
                    The seller's stablecoins are automatically locked in the smart contract escrow, ensuring security
                    for both parties.
                  </p>
                </li>
                <li className="ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-white">
                    <span className="text-[#0155FF] font-bold">4</span>
                  </span>
                  <h3 className="text-lg font-semibold mb-1">Automatic Completion</h3>
                  <p className="text-gray-600">
                    Once the seller confirms receipt of the fiat payment, the smart contract automatically transfers the
                    stablecoins to the buyer.
                  </p>
                </li>
              </ol>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">OTC Deal Flow</div>
                  <div className="bg-[#0155FF]/50 text-white text-xs font-medium px-2.5 py-0.5 rounded">Secure</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-white text-[#0155FF] font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 border border-[#0155FF]">
                      B
                    </div>
                    <div>
                      <p className="font-medium">Bob sends crypto to the smart contract</p>
                      <p className="text-sm text-gray-500">
                        The crypto is locked in escrow, controlled by the clearing house
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-white text-[#0155FF] font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 border border-[#0155FF]">
                      A
                    </div>
                    <div>
                      <p className="font-medium">Alice sends fiat to the centralizer</p>
                      <p className="text-sm text-gray-500">The payment is processed through the agreed method</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-white text-[#0155FF] font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 border border-[#0155FF]">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Automatic completion</p>
                      <p className="text-sm text-gray-500">
                        As soon as the centralizer receives the fiat, the smart contract is invoked and the crypto is
                        sent to Alice. The fiat is sent to Bob.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <GradientButton asChild className="w-full">
                    <Link href="/register">Register Your Company</Link>
                  </GradientButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How We Compare</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our OTC exchange compares to traditional P2P platforms
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-gray-50 border-b-2 border-gray-200"></th>
                  <th className="p-4 bg-[#0155FF]/50 text-white border-b-2 border-blue-200">Our OTC Exchange</th>
                  <th className="p-4 bg-gray-50 text-gray-700 border-b-2 border-gray-200">Traditional P2P Exchanges</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left p-4 border-b border-gray-100 font-medium">Security of Funds</td>
                  <td className="p-4 border-b border-gray-100 bg-blue-50">
                    Stablecoins locked in decentralized smart contract
                  </td>
                  <td className="p-4 border-b border-gray-100">
                    Crypto stored on exchange wallets (centralized point of failure)
                  </td>
                </tr>
                <tr>
                  <td className="text-left p-4 border-b border-gray-100 font-medium">Confirmation Process</td>
                  <td className="p-4 border-b border-gray-100 bg-blue-50">
                    Automated process with no manual confirmations needed
                  </td>
                  <td className="p-4 border-b border-gray-100">Manual confirmations required from both parties</td>
                </tr>
                <tr>
                  <td className="text-left p-4 border-b border-gray-100 font-medium">Transaction Volume</td>
                  <td className="p-4 border-b border-gray-100 bg-blue-50">Optimized for high-volume exchanges</td>
                  <td className="p-4 border-b border-gray-100">Often limited by manual processes</td>
                </tr>
                <tr>
                  <td className="text-left p-4 border-b border-gray-100 font-medium">Onboarding</td>
                  <td className="p-4 border-b border-gray-100 bg-blue-50">
                    Focused on corporate entities with streamlined process
                  </td>
                  <td className="p-4 border-b border-gray-100">Primarily designed for individuals with complex KYC</td>
                </tr>
                <tr>
                  <td className="text-left p-4 font-medium">Transparency</td>
                  <td className="p-4 bg-blue-50">All transactions recorded on blockchain with complete visibility</td>
                  <td className="p-4">Limited transparency, dependent on exchange policies</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#0155FF] to-[#00DB49] text-white relative overflow-hidden">
        {/* Гильош (декоративный узор) */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="guilloche3" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="white" strokeWidth="1" />
                <path d="M0,30 Q25,80 50,30 T100,30" fill="none" stroke="white" strokeWidth="1" />
                <path d="M0,70 Q25,20 50,70 T100,70" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#guilloche3)" />
          </svg>
        </div>

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the security and efficiency of our smart contract-based OTC exchange platform.
          </p>
          <GradientButton asChild size="lg" variant="white" className="px-8">
            <Link href="/register">Register Your Company</Link>
          </GradientButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-4 md:mb-0">
              <Image
                src="/images/logo-footer.png"
                alt="OTC Exchange"
                width={150}
                height={150}
                className="h-16 w-auto"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">OTC Exchange</h3>
              <p className="mb-4">Secure cryptocurrency trading with smart contract escrow.</p>
              <Link href="#" className="hover:text-white transition-colors">
                GitHub
              </Link>
            </div>
            <div>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} OTC Exchange. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


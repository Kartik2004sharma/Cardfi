import { HeroSection } from "@/components/blocks/hero-section-1"
import { PricingPlans } from "@/components/blocks/pricing-plans"
import { Testimonials } from "@/components/blocks/testimonials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-grow">
        <HeroSection />
        
        {/* Technical Architecture Section */}
        <section id="about" className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-24">
              {/* Left side - Content */}
              <div className="flex-1 md:pr-8">
                <h2 className="text-4xl font-bold mb-6">Technical Architecture</h2>
                <p className="text-xl text-gray-300 mb-8">
                  CardFi Yield Manager employs cutting-edge DeFi protocols and Web3 infrastructure for seamless yield optimization and card integration.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-white">Frontend</span>
                      <span className="text-gray-300">: Next.js with React and Tailwind CSS for responsive DeFi dashboard</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-white">Web3 Integration</span>
                      <span className="text-gray-300">: MetaMask SDK with Delegation Toolkit for seamless transactions</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-white">DeFi Layer</span>
                      <span className="text-gray-300">: Smart contracts for automated yield strategy execution</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-white">Circle Integration</span>
                      <span className="text-gray-300">: Programmable wallets for secure USDC custody and management</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-white">Cross-Chain</span>
                      <span className="text-gray-300">: LI.FI SDK for multichain USDC bridging and protocol access</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Architecture Diagram (Tailwind) */}
              <div className="flex-1 md:pl-8 flex flex-col items-center justify-center space-y-6">
                
                {/* Node 1 */}
                <div className="w-64 border border-white/20 bg-white/5 rounded-xl p-4 flex flex-col items-center shadow-lg relative">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  </div>
                  <span className="font-semibold text-white">MetaMask Card</span>
                  <span className="text-xs text-gray-400">User spend trigger</span>
                </div>

                <div className="h-8 border-l-2 border-dashed border-white/30"></div>

                {/* Node 2 */}
                <div className="w-64 border border-white/20 bg-white/5 rounded-xl p-4 flex flex-col items-center shadow-lg relative">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
                  </div>
                  <span className="font-semibold text-white">Yield Manager Contract</span>
                  <span className="text-xs text-gray-400">Automated Smart Contract Logic</span>
                </div>

                <div className="h-8 border-l-2 border-dashed border-white/30"></div>

                {/* Split Nodes */}
                <div className="flex gap-4 w-full max-w-[400px] justify-center relative">
                  {/* Horizontal connecting line */}
                  <div className="absolute top-0 w-3/4 border-t-2 border-dashed border-white/30"></div>
                  
                  {/* Node 3 */}
                  <div className="flex-1 border border-white/20 bg-white/5 rounded-xl p-4 flex flex-col items-center shadow-lg mt-4">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    </div>
                    <span className="font-semibold text-white text-sm text-center">Circle & LI.FI</span>
                  </div>
                  
                  {/* Node 4 */}
                  <div className="flex-1 border border-white/20 bg-white/5 rounded-xl p-4 flex flex-col items-center shadow-lg mt-4">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <span className="font-semibold text-white text-sm text-center">Aave V3 Yield</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
        
        <PricingPlans />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

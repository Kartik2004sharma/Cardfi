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
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-blue-400">Frontend</span>
                      <span className="text-gray-300">: Next.js with React and Tailwind CSS for responsive DeFi dashboard</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-orange-400">Web3 Integration</span>
                      <span className="text-gray-300">: MetaMask SDK with Delegation Toolkit for seamless transactions</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-yellow-400">DeFi Layer</span>
                      <span className="text-gray-300">: Smart contracts for automated yield strategy execution</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-green-400">Circle Integration</span>
                      <span className="text-gray-300">: Programmable wallets for secure USDC custody and management</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-purple-400">Cross-Chain</span>
                      <span className="text-gray-300">: LI.FI SDK for multichain USDC bridging and protocol access</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Image */}
              <div className="flex-1 md:pl-8 flex justify-center">
                <img 
                  src="/images/architecture-preview.png" 
                  alt="CardFi Architecture Diagram"
                  className="w-[300px] rounded-xl shadow-lg"
                />
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

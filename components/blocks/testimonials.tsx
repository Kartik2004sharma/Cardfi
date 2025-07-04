"use client"

import { Quote, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote: "CardFi makes my USDC work while I spend. It's like getting cashback in DeFi. Perfect automation.",
    name: "Emma Thompson",
    handle: "@emmaDeFi",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    avatar: "ET",
    role: "DeFi Enthusiast",
    rating: 5
  },
  {
    quote: "I don't worry about APRs anymore. CardFi optimizes it all on autopilot. Best DeFi tool ever.",
    name: "David Park", 
    handle: "@daviddefi",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    avatar: "DP",
    role: "Yield Farmer",
    rating: 4
  },
  {
    quote: "Finally, a dashboard that connects my MetaMask Card to real returns. Smart and efficient.",
    name: "Sofia Rodriguez",
    handle: "@sofiayield",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    avatar: "SR", 
    role: "Treasury Lead",
    rating: 5
  },
  {
    quote: "The automation is seamless. Set it once, earn forever. CardFi handles everything perfectly.",
    name: "Alex Chen",
    handle: "@alexdefi",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    avatar: "AC",
    role: "DeFi Builder",
    rating: 4
  },
  {
    quote: "Best ROI I've seen from any DeFi tool. CardFi just works. Amazing passive income.",
    name: "Maria Santos",
    handle: "@mariayield",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    avatar: "MS",
    role: "Crypto Investor", 
    rating: 5
  },
  {
    quote: "Love how it bridges traditional card spending with DeFi yields. Revolutionary platform indeed.",
    name: "James Wilson",
    handle: "@jamesweb3",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    avatar: "JW",
    role: "Web3 Dev",
    rating: 4
  }
]

function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <Card className="w-[350px] flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 rounded-xl">
      <CardContent className="p-8">
        {/* Quote */}
        <div className="mb-6">
          <Quote className="w-5 h-5 text-purple-400 mb-4" />
          <p className="text-white text-base leading-relaxed font-medium h-[72px] overflow-hidden">
            "{testimonial.quote}"
          </p>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src={testimonial.image} 
              alt={testimonial.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-white font-semibold text-sm">${testimonial.avatar}</span>`;
                }
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-base mb-1">
              {testimonial.name}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-purple-400 font-semibold tracking-wide">
                {testimonial.handle}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">
                {testimonial.role}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Testimonials() {
  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section id="testimonials" className="py-20 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by DeFi Builders & Card Users Worldwide
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            CardFi empowers everyday crypto users to earn passively — without needing to manage DeFi complexity manually.
          </p>
        </div>

        {/* Scrolling testimonials carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 animate-scroll hover:pause"
              style={{
                animation: 'scroll 40s linear infinite'
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <TestimonialCard 
                  key={`${testimonial.handle}-${index}`}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </div>
          
          {/* Gradient overlays for smooth edges */}
          <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Social proof stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-2">$2.4M+</div>
            <div className="text-gray-400 text-sm">USDC Optimized</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">1,200+</div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">8.6%</div>
            <div className="text-gray-400 text-sm">Avg APY Boost</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to optimize your USDC yield?
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of users earning passive income through automated DeFi strategies connected to their MetaMask Card.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                Start Free Trial
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * ${testimonials.length} - ${testimonials.length * 24}px));
          }
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}

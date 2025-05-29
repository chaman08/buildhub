
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 to-blue-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Get Bids From
              <span className="text-orange-600 block">Trusted Contractors</span>
              <span className="text-blue-600">Across India</span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Post your project for free and receive quotes from verified professionals 
              across architecture, civil, electrical, interiors, and more.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6 flex items-center gap-2"
              >
                🏗️ Post a Project
                <ArrowRight className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
              >
                👷 Join as Contractor
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>100% Free for Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Verified Contractors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>40+ Cities Covered</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="space-y-4">
                <div className="h-4 bg-orange-200 rounded w-3/4"></div>
                <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🏗️</span>
                </div>
                <div className="h-4 bg-green-200 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-orange-500 rounded flex-1 flex items-center justify-center text-white text-xs">
                    ₹5,00,000
                  </div>
                  <div className="h-8 bg-blue-500 rounded flex-1 flex items-center justify-center text-white text-xs">
                    30 Days
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg animate-bounce">
              👨‍🔧
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
              📐
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

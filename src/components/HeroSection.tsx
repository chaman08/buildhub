
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, MapPin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Trusted by 10,000+ Professionals
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Connect with
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Verified Contractors
              </span>
              <span className="text-gray-700">Nationwide</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
              Post your construction project and receive competitive bids from 
              pre-verified professionals across architecture, engineering, and specialized trades.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4 h-14 shadow-lg shadow-blue-200"
              >
                Post Your Project
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-4 h-14"
              >
                Browse Professionals
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">100% Verified</div>
                  <div className="text-sm text-gray-500">KYC Validated</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Free Platform</div>
                  <div className="text-sm text-gray-500">For Customers</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pan-India</div>
                  <div className="text-sm text-gray-500">Coverage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              {/* Mock Project Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-indigo-200 rounded w-32"></div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-center h-24 bg-white rounded-xl shadow-sm">
                    <Building2 className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-4 text-center">
                    <div className="text-lg font-bold">₹8,50,000</div>
                    <div className="text-sm opacity-90">Budget Range</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 text-center">
                    <div className="text-lg font-bold">6 Weeks</div>
                    <div className="text-sm opacity-90">Timeline</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-2xl shadow-lg animate-float">
              <Users className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <Shield className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

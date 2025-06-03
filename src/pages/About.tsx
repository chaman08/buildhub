
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, MapPin, Building2, Target, Heart, Award, TrendingUp, Search, FileText, Handshake, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from '@/contexts/AuthContext';

const About = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const handleJoinMission = () => {
    if (!currentUser) {
      navigate('/auth');
    } else if (userProfile?.userType === 'contractor') {
      navigate('/contractor-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handlePostProject = () => {
    if (!currentUser) {
      navigate('/auth');
    } else if (userProfile?.userType === 'contractor') {
      navigate('/contractor-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleBrowseContractors = () => {
    navigate('/contractors');
  };

  const services = [
    {
      icon: FileText,
      title: "Project Posting",
      description: "Post your construction project with detailed requirements, budget, and timeline. Reach thousands of verified contractors instantly."
    },
    {
      icon: Search,
      title: "Contractor Discovery",
      description: "Browse through our extensive network of verified contractors, view their profiles, ratings, and previous work portfolios."
    },
    {
      icon: Award,
      title: "Competitive Bidding",
      description: "Receive multiple competitive bids from interested contractors, compare prices, timelines, and choose the best fit for your project."
    },
    {
      icon: Handshake,
      title: "Secure Connections",
      description: "Connect directly with contractors through our platform, discuss project details, and finalize agreements with confidence."
    }
  ];

  const howItWorksSteps = [
    { 
      step: "01", 
      title: "Post Your Project", 
      desc: "Share your construction needs, budget range, preferred timeline, and location. Our smart matching system starts working immediately.",
      icon: FileText
    },
    { 
      step: "02", 
      title: "Receive Competitive Bids", 
      desc: "Verified contractors review your project and submit detailed proposals with pricing, timelines, and approach strategies.",
      icon: Users
    },
    { 
      step: "03", 
      title: "Review & Compare", 
      desc: "Evaluate contractor profiles, read reviews, compare pricing, and assess their previous work through detailed portfolios.",
      icon: Search
    },
    { 
      step: "04", 
      title: "Connect & Build", 
      desc: "Choose your preferred contractor, finalize terms, and start your construction journey with complete transparency and support.",
      icon: Building2
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Verification",
      description: "Every contractor undergoes rigorous KYC verification, background checks, and document validation to ensure maximum reliability and safety."
    },
    {
      icon: Heart,
      title: "Customer-Centric Approach",
      description: "We prioritize your needs with free platform access, dedicated support, and tools designed to make your construction journey smooth."
    },
    {
      icon: TrendingUp,
      title: "Empowering Growth",
      description: "Supporting small and medium contractors by providing them with a platform to showcase their skills and grow their businesses sustainably."
    },
    {
      icon: Target,
      title: "Quality Assurance",
      description: "Focused on connecting the right professionals with suitable projects through intelligent matching and comprehensive quality controls."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                About 
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BuildHub
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                BuildHub is India's most trusted platform connecting customers with verified contractors. 
                From small repairs to large construction projects, we make it easy to find the right professional for your needs.
                Our mission is to transform the construction industry through technology, transparency, and trust.
              </p>
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive solutions for all your construction and renovation needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-0 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">How BuildHub Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our streamlined process makes it easy to connect customers with the right contractors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((item, index) => (
                <div key={index} className="relative">
                  <Card className="p-6 border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-0 text-center">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-4">
                          {item.step}
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <item.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        {index < 3 && (
                          <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200"></div>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose BuildHub */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose BuildHub?</h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    For years, Indian customers have struggled with trust issues, cost overruns, and finding 
                    reliable contractors. BuildHub was created by engineers and construction professionals who 
                    understand these challenges firsthand.
                  </p>
                  <p>
                    We leverage technology to bridge the gap between those who build and those who need construction 
                    services. Our platform ensures transparency, reliability, and fair pricing for everyone involved.
                  </p>
                  <p>
                    We're committed to supporting contractors across all cities, empowering small businesses, and creating 
                    a safe, verified, and transparent ecosystem that benefits the entire construction industry.
                  </p>
                </div>
                <div className="mt-8">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
                    onClick={handleJoinMission}
                  >
                    Join BuildHub Today
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">100% Verified Contractors</h4>
                          <p className="text-blue-100">Complete KYC validation and background verification</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Free for Customers</h4>
                          <p className="text-green-100">No hidden charges, completely free platform access</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Quality Assurance</h4>
                          <p className="text-purple-100">Comprehensive quality checks and project monitoring</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do at BuildHub
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Building?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers who found their perfect contractor through BuildHub
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                onClick={handlePostProject}
              >
                Post Your Project
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                onClick={handleBrowseContractors}
              >
                Browse Contractors
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;

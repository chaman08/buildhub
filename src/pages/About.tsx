import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, MapPin, Building2, Target, Heart, Award, TrendingUp } from "lucide-react";
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

  const stats = [
    { number: "10,000+", label: "Verified Contractors", icon: Users },
    { number: "25,000+", label: "Projects Completed", icon: Building2 },
    { number: "50+", label: "Cities Covered", icon: MapPin },
    { number: "98%", label: "Customer Satisfaction", icon: Award },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Every contractor is verified through rigorous KYC processes, ensuring reliability and authenticity."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "We prioritize customer satisfaction by providing free access and ensuring quality connections."
    },
    {
      icon: TrendingUp,
      title: "Empowering Growth",
      description: "Supporting small contractors and helping them grow their businesses through our platform."
    },
    {
      icon: Target,
      title: "Quality Delivery",
      description: "Focused on connecting the right professionals with the right projects for successful outcomes."
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
                Connecting India's 
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Builders with Dreamers
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                At BuildConnect, we believe that building a home, office, or commercial space should be efficient, 
                affordable, and honest. That's why we've created India's first transparent construction tender 
                platform – where anyone can post their project and receive competitive bids from verified professionals.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-4">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">How We Work</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our streamlined process makes it easy to connect customers with the right contractors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Post Your Project", desc: "Share your requirements, budget, and timeline" },
                { step: "02", title: "Receive Competitive Bids", desc: "Verified contractors submit their proposals" },
                { step: "03", title: "Review & Compare", desc: "Evaluate profiles, ratings, and pricing" },
                { step: "04", title: "Connect & Build", desc: "Choose your contractor and start building" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                      {item.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why We Built This */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why We Built This</h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    For years, Indian customers have struggled with trust issues, cost overruns, and finding 
                    reliable contractors. Our team, built by engineers and real estate professionals, wanted 
                    to solve this with technology that bridges the gap between those who build and those who need it.
                  </p>
                  <p>
                    We're committed to supporting Tier 2 and 3 cities, empowering small contractors, and creating 
                    a safe, verified, and transparent process that benefits everyone in the construction ecosystem.
                  </p>
                </div>
                <div className="mt-8">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
                    onClick={handleJoinMission}
                  >
                    Join Our Mission
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Pan-India Coverage</h4>
                        <p className="text-blue-100">Serving customers across all major cities</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">100% Verified</h4>
                        <p className="text-blue-100">All contractors undergo KYC validation</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Customer First</h4>
                        <p className="text-blue-100">Always free for customers to use</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do
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
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Build Your Dream?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers who found their perfect contractor through BuildConnect
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
                className="border-white text-blue-600 hover:bg-white px-8 py-3"
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

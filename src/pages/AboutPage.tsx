
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Hammer, FileText, Upload, BadgeCheck, Star, Filter, Briefcase, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Section 1: Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary-800 to-primary-600 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in">
              Connecting You to India's Most Reliable Contractors & Projects
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 animate-fade-in">
              From home renovations to large-scale government tenders — BuildHub bridges the gap between skilled professionals and real-world projects.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Our Mission */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 after:content-[''] after:block after:w-24 after:h-1 after:bg-secondary after:mx-auto after:mt-4">
              Our Mission
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              At BuildHub, our mission is to empower individuals, businesses, and government organizations by simplifying how construction and renovation projects are posted, managed, and executed. We aim to be India's most trusted platform for contractor discovery, tender management, and real-time project collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: What We Offer */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-12 text-center">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Customers & Government Agencies */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-6 flex items-center text-primary-700">
                <Upload className="mr-3" size={24} />
                For Customers & Government Agencies
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-4 mt-1">
                    <Upload size={16} className="text-primary" />
                  </div>
                  <span>Post private or public construction-related projects</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-4 mt-1">
                    <FileText size={16} className="text-primary" />
                  </div>
                  <span>Receive bids from verified contractors</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-4 mt-1">
                    <FileText size={16} className="text-primary" />
                  </div>
                  <span>Track proposals, timelines, and communications</span>
                </li>
              </ul>
            </div>

            {/* For Contractors */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-6 flex items-center text-primary-700">
                <Hammer className="mr-3" size={24} />
                For Contractors
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-4 mt-1">
                    <Briefcase size={16} className="text-primary" />
                  </div>
                  <span>Apply to relevant tenders and customer projects</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-4 mt-1">
                    <Star size={16} className="text-primary" />
                  </div>
                  <span>Build your reputation through reviews and ratings</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-4 mt-1">
                    <FileText size={16} className="text-primary" />
                  </div>
                  <span>Manage your proposals, leads, and work history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Why Choose BuildHub? */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')] opacity-5 bg-cover bg-center"></div>
        <div className="container-custom relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-12 text-center">
            Why Choose BuildHub?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <BadgeCheck />, text: "Verified Contractors Across India" },
              { icon: <Star />, text: "Transparent Bidding & Ratings" },
              { icon: <Filter />, text: "Smart Filters for Budget, Category & Location" },
              { icon: <Briefcase />, text: "Supports Private & Government Projects" },
              { icon: <FileText />, text: "Mobile-First User Experience" }
            ].map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow hover:translate-y-[-4px]">
                <CardContent className="flex items-start p-6">
                  <div className="bg-secondary-100 text-secondary p-3 rounded-full mr-4">
                    {item.icon}
                  </div>
                  <p className="font-medium text-gray-700">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
              A Platform Built by Builders
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/3">
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-full p-8 aspect-square flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="BuildHub Team"
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <p className="text-gray-700 leading-relaxed">
                  Founded by engineers and tech innovators, BuildHub was born from the need to eliminate the chaos of finding trusted professionals for construction and infrastructure work. We believe technology can streamline India's construction ecosystem — from a local mason to a national highway tender.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Ready to Get Started?
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="hover:scale-105 transition-transform"
            >
              <Link to="/post-project" className="flex items-center gap-2">
                <Send size={18} />
                Post a Project
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white text-primary-700 border-white hover:bg-white/90 hover:scale-105 transition-transform"
            >
              <Link to="/signup" className="flex items-center gap-2">
                <Hammer size={18} />
                Join as Contractor
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white text-primary-700 border-white hover:bg-white/90 hover:scale-105 transition-transform"
            >
              <Link to="/tenders" className="flex items-center gap-2">
                <FileText size={18} />
                Explore Government Tenders
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

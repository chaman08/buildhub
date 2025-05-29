
import { Shield, Star, Globe, MessageCircle, CreditCard, Users } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Advanced KYC verification with Aadhaar and GST validation ensures only qualified professionals join our network.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Star,
      title: "Transparent Rating System", 
      description: "Comprehensive reviews and ratings from verified customers help you make informed decisions with confidence.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Globe,
      title: "Nationwide Coverage",
      description: "Access to qualified contractors across all major cities and regions, from metros to emerging markets.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: MessageCircle,
      title: "Secure Communication",
      description: "Built-in encrypted messaging system protects your privacy until you're ready to share contact details.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: CreditCard,
      title: "Zero Cost for Customers",
      description: "Complete access to our platform including project posting, bid management, and contractor communication at no cost.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Designed for serious construction professionals with industry-standard practices and reliable service delivery.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-700 text-sm font-medium mb-6 shadow-sm">
            Why BuildConnect
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            The Professional Choice
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            More than just a marketplace. We're your trusted partner in 
            connecting with verified, reliable construction professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="group h-full">
              <div className={`${feature.bgColor} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 h-full border border-white`}>
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-8">Trusted by Industry Leaders</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">15,000+</div>
                <div className="text-blue-100 font-medium">Projects Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5,000+</div>
                <div className="text-blue-100 font-medium">Verified Professionals</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-blue-100 font-medium">Cities Covered</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">99%</div>
                <div className="text-blue-100 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

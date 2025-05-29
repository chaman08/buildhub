
const WhyChooseUs = () => {
  const features = [
    {
      icon: "🛡️",
      title: "Verified Contractor Profiles",
      description: "Every contractor undergoes KYC verification with Aadhaar and GST validation for your safety."
    },
    {
      icon: "⭐",
      title: "Ratings & Reviews System", 
      description: "Read genuine reviews from past customers to make informed decisions about your contractor."
    },
    {
      icon: "🗺️",
      title: "Local & Regional Coverage",
      description: "Find contractors in your city and PIN code area. Serving Tier 1, 2, and 3 cities across India."
    },
    {
      icon: "💬",
      title: "Built-in Secure Chat",
      description: "Communicate safely within the platform. No need to share personal numbers until you're ready."
    },
    {
      icon: "🆓",
      title: "Completely Free for Customers",
      description: "Post unlimited projects, receive bids, and contact contractors - all at zero cost to you."
    },
    {
      icon: "🇮🇳",
      title: "Made for India",
      description: "Designed specifically for Indian construction needs with local payment methods and regional support."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose NirmaanBazaar?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not just another listing website. We're your trusted partner in 
            connecting you with reliable, verified contractors across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-gray-50 rounded-xl p-8 hover:bg-orange-50 transition-colors duration-300 h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Trusted by Thousands Across India</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span>5000+ Projects Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👷</span>
              <span>2000+ Verified Contractors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span>40+ Cities Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💯</span>
              <span>98% Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

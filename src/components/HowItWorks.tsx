
const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Post Your Project",
      description: "Fill out your needs, location, budget, and timeline in just 3 minutes.",
      icon: "📝",
      color: "bg-orange-500"
    },
    {
      number: "2", 
      title: "Get Bids from Verified Contractors",
      description: "Qualified contractors review your project and place competitive bids.",
      icon: "💼",
      color: "bg-blue-500"
    },
    {
      number: "3",
      title: "Compare & Contact",
      description: "Review profiles, pricing, and past work before making a decision.",
      icon: "🔍",
      color: "bg-green-500"
    },
    {
      number: "4",
      title: "Hire with Confidence", 
      description: "Directly connect, negotiate, and finalize your contractor.",
      icon: "🤝",
      color: "bg-purple-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get your construction project started in 4 simple steps. 
            It's fast, secure, and completely free for customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-300 transform translate-x-4 z-0">
                  <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-b-2 border-t-transparent border-b-transparent transform translate-x-1"></div>
                </div>
              )}
              
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10">
                <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                  {step.number}
                </div>
                
                <div className="text-4xl text-center mb-4">{step.icon}</div>
                
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Ready to get started? Post your first project today!
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            Start Your Project →
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


import { CheckCircle, Search, MessageSquare, Handshake } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Post Your Project",
      description: "Share project details, timeline, budget, and location in our streamlined form.",
      icon: CheckCircle,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      number: "02", 
      title: "Receive Competitive Bids",
      description: "Verified professionals review your requirements and submit detailed proposals.",
      icon: Search,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    {
      number: "03",
      title: "Compare & Communicate",
      description: "Evaluate proposals, review profiles, and engage directly with contractors.",
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      number: "04",
      title: "Hire with Confidence", 
      description: "Select your preferred contractor and begin your project with full transparency.",
      icon: Handshake,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get your construction project started with our streamlined process. 
            Fast, secure, and completely transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 transform translate-x-4 z-0">
                  <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-b-2 border-t-transparent border-b-transparent transform translate-x-1"></div>
                </div>
              )}
              
              <div className={`${step.bgColor} ${step.borderColor} border-2 rounded-2xl p-8 group-hover:shadow-xl transition-all duration-300 relative z-10 h-full`}>
                <div className={`bg-gradient-to-r ${step.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 shadow-lg`}>
                  {step.number}
                </div>
                
                <div className="text-center mb-6">
                  <step.icon className="h-12 w-12 mx-auto text-gray-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-8">
            Ready to start your project? Join thousands of satisfied customers.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl">
            Start Your Project
            <CheckCircle className="inline-block ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

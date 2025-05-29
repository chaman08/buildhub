
import { Button } from "@/components/ui/button";

const PricingTeaser = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "3 bids per month",
        "Basic profile listing",
        "Limited contact access",
        "Email support"
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const
    },
    {
      name: "Starter", 
      price: "₹299",
      period: "/month",
      description: "Great for active contractors",
      features: [
        "10 bids per month",
        "Enhanced profile listing",
        "Customer contact access",
        "Chat support",
        "Project alerts"
      ],
      popular: true,
      buttonText: "Choose Starter",
      buttonVariant: "default" as const
    },
    {
      name: "Pro",
      price: "₹799", 
      period: "/month",
      description: "For serious professionals",
      features: [
        "Unlimited bids",
        "Priority listing",
        "Verified badge",
        "Full analytics dashboard", 
        "Phone support",
        "Featured placement"
      ],
      popular: false,
      buttonText: "Go Pro",
      buttonVariant: "outline" as const
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Contractor Pricing Plans
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan to grow your construction business. 
            All plans include access to our verified customer base.
          </p>
          <div className="mt-6 bg-green-100 text-green-800 px-6 py-3 rounded-full inline-block">
            🎉 <strong>100% Free for Customers</strong> - Post unlimited projects at no cost!
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${plan.popular ? 'border-orange-500 transform scale-105' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">
                    {plan.period}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full py-3 ${plan.popular ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Questions about our pricing? We're here to help!
          </p>
          <Button variant="outline" size="lg">
            Contact Sales Team
          </Button>
        </div>

        {/* Payment Methods */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Secure Indian Payment Methods
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-6 text-lg">
            <span className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              UPI
            </span>
            <span className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              Credit/Debit Cards
            </span>
            <span className="flex items-center gap-2">
              <span className="text-2xl">🏦</span>
              Net Banking
            </span>
            <span className="flex items-center gap-2">
              <span className="text-2xl">📲</span>
              PhonePe/Paytm
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingTeaser;

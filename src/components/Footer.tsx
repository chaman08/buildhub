
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "#" },
      { name: "How It Works", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" }
    ],
    services: [
      { name: "Post a Project", href: "#" },
      { name: "Browse Contractors", href: "#" },
      { name: "Contractor Signup", href: "#" },
      { name: "Pricing", href: "#" }
    ],
    legal: [
      { name: "Terms & Conditions", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Refund Policy", href: "#" },
      { name: "Dispute Resolution", href: "#" }
    ],
    cities: [
      { name: "Contractors in Mumbai", href: "#" },
      { name: "Contractors in Delhi", href: "#" },
      { name: "Contractors in Bangalore", href: "#" },
      { name: "Contractors in Pune", href: "#" },
      { name: "Contractors in Chennai", href: "#" },
      { name: "View All Cities", href: "#" }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="text-2xl font-bold text-orange-500">
                NirmaanBazaar
              </div>
              <div className="ml-2 text-sm text-gray-400">
                🇮🇳
              </div>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              India's most trusted platform connecting customers with verified contractors. 
              From small repairs to large construction projects, we make it easy to find 
              the right professional for your needs.
            </p>
            
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span>support@nirmaanbazaar.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📱</span>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>NIT Raipur Incubation Center, Chhattisgarh</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="text-2xl">📘</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="text-2xl">📷</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="text-2xl">💼</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <span className="text-2xl">🐦</span>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-orange-500 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-orange-500 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-orange-500 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Popular Cities */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Popular Cities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {footerLinks.cities.map((city, index) => (
              <a 
                key={index} 
                href={city.href} 
                className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
              >
                {city.name}
              </a>
            ))}
          </div>
        </div>

        {/* Language & Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <span className="text-gray-400 text-sm">Language:</span>
            <div className="flex space-x-2">
              <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm">
                EN
              </button>
              <button className="bg-gray-700 text-gray-400 px-3 py-1 rounded text-sm hover:bg-gray-600">
                हिंदी
              </button>
            </div>
          </div>
          
          <div className="text-gray-400 text-sm text-center md:text-right">
            <p>© {currentYear} NirmaanBazaar. All rights reserved.</p>
            <p className="mt-1">Made with ❤️ in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

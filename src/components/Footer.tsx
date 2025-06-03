
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleEmailClick = () => {
    window.open('mailto:support@buildhub.services', '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:+919243425538', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919243425538', '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="text-2xl font-bold text-orange-500">
                BuildHub
              </div>
              <div className="ml-2 text-sm text-gray-400">
                🇮🇳
              </div>
            </div>
            
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              India's most trusted platform connecting customers with verified contractors.
            </p>
            
            <div className="space-y-2 text-sm text-gray-400">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:text-orange-500 transition-colors"
                onClick={handleEmailClick}
              >
                <span>📧</span>
                <span>support@buildhub.services</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:text-orange-500 transition-colors"
                onClick={handlePhoneClick}
              >
                <span>📱</span>
                <span>+91 92434 25538</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>Raipur, Chhattisgarh</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Construction Projects
                </Link>
              </li>
              <li>
                <Link to="/contractors" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Find Contractors
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Post a Project
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Interior Design</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Architecture Services</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Join as Contractor
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Help Center</span>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://drive.google.com/file/d/1aLchyWhfgNnotIGnvsTT4dksVBr3CZdq/uc?export=download" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Privacy Policy</span>
              </li>
              <li>
                <button 
                  onClick={handleWhatsAppClick}
                  className="text-gray-400 hover:text-orange-500 transition-colors text-sm text-left"
                >
                  WhatsApp Support
                </button>
              </li>
              <li>
                <span className="text-gray-400 text-sm">FAQ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <div className="text-gray-400 text-sm">
            <p>© {currentYear} BuildHub. All rights reserved. | Made with ❤️ in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

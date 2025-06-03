
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              From small repairs to large construction projects, we make it easy to find 
              the right professional for your needs.
            </p>
            
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span>support@buildhub.services</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📱</span>
                <span>+91 92434 25538</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>LIG 540 HB Colony Raipur Chhattisgarh</span>
              </div>
            </div>
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
                <Link to="/auth" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/contractors" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Find Contractors
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Browse Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://drive.google.com/file/d/1aLchyWhfgNnotIGnvsTT4dksVBr3CZdq/view" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                >
                  Terms and Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <div className="text-gray-400 text-sm">
            <p>© {currentYear} BuildHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

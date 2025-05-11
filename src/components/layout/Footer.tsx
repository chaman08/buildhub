
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <h2 className="font-bold text-2xl text-white">BuildHub</h2>
            </Link>
            <p className="mt-4 text-gray-400">
              Connecting quality contractors with customers for all your construction and home improvement needs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-secondary transition-colors">
                  Find Contractors
                </Link>
              </li>
              <li>
                <Link to="/post-project" className="text-gray-400 hover:text-secondary transition-colors">
                  Post Project
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Contractors */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">For Contractors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contractor-signup" className="text-gray-400 hover:text-secondary transition-colors">
                  Join as Contractor
                </Link>
              </li>
              <li>
                <Link to="/contractor-dashboard" className="text-gray-400 hover:text-secondary transition-colors">
                  Contractor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/tenders" className="text-gray-400 hover:text-secondary transition-colors">
                  Browse Tenders
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-400 hover:text-secondary transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <address className="not-italic text-gray-400">
              <p>1234 Construction Avenue</p>
              <p>Builder's District, BH 45678</p>
              <p className="mt-2">Email: info@buildhub.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} BuildHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

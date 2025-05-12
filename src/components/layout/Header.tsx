
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="font-bold text-2xl text-primary">BuildHub</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/search" 
              className={`text-gray-700 hover:text-primary transition-colors ${location.pathname === '/search' ? 'text-primary font-medium' : ''}`}
            >
              Find Contractors
            </Link>
            <Link 
              to="/post-project" 
              className={`text-gray-700 hover:text-primary transition-colors ${location.pathname === '/post-project' ? 'text-primary font-medium' : ''}`}
            >
              Post Project
            </Link>
            <Link 
              to="/tenders" 
              className={`text-gray-700 hover:text-primary transition-colors ${location.pathname === '/tenders' ? 'text-primary font-medium' : ''}`}
            >
              Tenders
            </Link>
            <Link 
              to="/about" 
              className={`text-gray-700 hover:text-primary transition-colors ${location.pathname === '/about' ? 'text-primary font-medium' : ''}`}
            >
              About
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="button-outline">
              Log In
            </Link>
            <Link to="/signup" className="button-primary">
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t animate-slide-in">
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/search" 
                className={`text-gray-700 hover:text-primary py-2 transition-colors ${location.pathname === '/search' ? 'text-primary font-medium' : ''}`}
              >
                Find Contractors
              </Link>
              <Link 
                to="/post-project" 
                className={`text-gray-700 hover:text-primary py-2 transition-colors ${location.pathname === '/post-project' ? 'text-primary font-medium' : ''}`}
              >
                Post Project
              </Link>
              <Link 
                to="/tenders" 
                className={`text-gray-700 hover:text-primary py-2 transition-colors ${location.pathname === '/tenders' ? 'text-primary font-medium' : ''}`}
              >
                Tenders
              </Link>
              <Link 
                to="/about" 
                className={`text-gray-700 hover:text-primary py-2 transition-colors ${location.pathname === '/about' ? 'text-primary font-medium' : ''}`}
              >
                About
              </Link>
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Link to="/login" className="button-outline w-full text-center">
                  Log In
                </Link>
                <Link to="/signup" className="button-primary w-full text-center">
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

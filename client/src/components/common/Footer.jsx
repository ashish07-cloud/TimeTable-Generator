import { Link } from "react-router-dom";
import { 
  Zap, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Github,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function Footer() {
  const { isDark } = useTheme();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'API Docs', href: '/api' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press', href: '/press' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Status', href: '/status' },
        { name: 'Documentation', href: '/docs' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR', href: '/gdpr' },
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className={`transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 border-gray-800 text-white' 
        : 'bg-gray-50 border-gray-200 text-gray-900'
    } border-t`}>
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark 
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                  : 'bg-gradient-to-br from-orange-500 to-orange-700'
              }`}>
                <Zap size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                AcadiaPlan
              </span>
            </div>
            <p className={`mb-4 max-w-md ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              AI-powered timetable generation for modern educational institutions. 
              Streamline your academic scheduling with cutting-edge technology.
            </p>
            
            {/* Contact Info */}
            <div className={`space-y-2 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>123 Education Street, Learning City, 560001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>hello@acadiaplan.com</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className={`font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className={`text-sm transition-colors hover:text-orange-500 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-8">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-gray-800 text-gray-400 hover:text-orange-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:text-orange-600 hover:bg-gray-100 shadow-sm'
              }`}
              aria-label={social.label}
            >
              <social.icon size={20} />
            </a>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className={`border-t pt-8 text-center ${
          isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              © {new Date().getFullYear()} AcadiaPlan. All rights reserved. Built for NEP 2020 compliance.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-orange-500 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
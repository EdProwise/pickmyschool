import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="text-2xl font-bold mb-4">
              <span>Pick</span>
              <span style={{ color: '#04d3d3' }}>MySchool</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in finding the perfect school for your child's bright future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/schools" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  Find Schools
                </Link>
              </li>
              <li>
                <Link href="/for-schools" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  For Schools
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>123 Education Street, New Delhi, India</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone size={20} className="flex-shrink-0" />
                <span>+91 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail size={20} className="flex-shrink-0" />
                <span>info@pickmyschool.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} PickMySchool. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
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

            {/* EdProwise Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">EdProwise Services</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.edprowise.com/services/digital-services" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                    School ERP & Digital Services
                  </a>
                </li>
                <li>
                  <a href="https://www.edprowise.com/services/academic-admin-services" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                    Academic & Admin
                  </a>
                </li>
                <li>
                  <a href="https://orbitschool.edprowise.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                    Orbit School - School Management
                  </a>
                </li>
                <li>
                  <a href="https://www.edprowise.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                    Recruit & Train Teacher
                  </a>
                </li>
                <li>
                  <a href="https://www.edprowise.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                    Marketing
                  </a>
                </li>
              </ul>
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
                  <li>
                    <Link href="/contact-expert" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                      Contact Expert
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-gray-400 hover:text-[#04d3d3] transition-colors">
                      Login
                    </Link>
                  </li>
                </ul>
            </div>


          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              
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
                <span>New Delhi,Delhi, India</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone size={20} className="flex-shrink-0" />
                <span>+91 995 852 8306</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail size={20} className="flex-shrink-0" />
                <span>info@edprowise.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} edprowise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

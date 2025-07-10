import { Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-semibold mb-4">NEWSLETTER</h3>
            <h4 className="text-xl font-bold mb-4">Stay up to crypto with DeTake</h4>
            <p className="text-gray-300 mb-6">
              Get the daily newsletter that helps thousands of investors understand the markets.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-teal-500"
              />
              <button className="bg-teal-500 px-6 py-2 rounded-r-lg hover:bg-teal-600 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                SUBSCRIBE
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">DISCLOSURE & POLICIES</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              CoinDesk is an award-winning media outlet that covers the cryptocurrency industry. Its journalists abide
              by a strict set of editorial policies. CoinDesk has adopted a set of principles aimed at ensuring the
              integrity, editorial independence and freedom from bias of its publications. CoinDesk is part of the
              Bullish group, which owns and invests in digital asset businesses and digital assets. CoinDesk employees,
              including journalists, may receive Bullish group equity-based compensation. Bullish was incubated by
              technology investor Peter Thiel's Founders Fund.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                News
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Podcasts
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Newsletters
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Events
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Roundtables
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Analytics
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Sitemap
              </a>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                About
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Manage Cookies
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Careers
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Contact Us
              </a>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <div>
              <h2 className="text-2xl font-bold">LOGO</h2>
              <p className="text-gray-400 text-sm">© DETAKE LLC</p>
            </div>
            <div className="flex space-x-4 text-gray-400">
              <span>𝕏</span>
              <span>📧</span>
              <span>📱</span>
              <span>💬</span>
              <span>📺</span>
              <span>📷</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

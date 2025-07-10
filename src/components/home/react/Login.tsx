import { Mail } from "lucide-react"
import { Wallet } from '@/components/common/react/ConnectWallet';

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Decentralized Takes.</h3>
        <p className="text-sm text-gray-600 mb-4">
          Log in or sign up for <span className="font-semibold">DeTake</span>
          <br />
          to get the best <span className="font-semibold">Content</span>
        </p>

        <div className="space-y-3">
          <button className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-teal-600">
            <Wallet />
          </button>

          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50">
            <Mail className="w-4 h-4" />
            <span>Continue with Email</span>
          </button>
        </div>
      </div>
    </div>
  )
}

import { Plus } from "lucide-react"
import Image from '@/components/common/react/Image'

const followUsers = [
  { name: "Alessia Francesca", handle: "@alessiafrancesca", avatar: "/placeholder.svg" },
  { name: "Alessia Francesca", handle: "@alessiafrancesca", avatar: "/placeholder.svg" },
  { name: "Alessia Francesca", handle: "@alessiafrancesca", avatar: "/placeholder.svg" },
  { name: "Alessia Francesca", handle: "@alessiafrancesca", avatar: "/placeholder.svg" },
  { name: "Alessia Francesca", handle: "@alessiafrancesca", avatar: "/placeholder.svg" },
]

export default function ToFollowList() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Who To Follow</h3>
        <div className="space-y-4">
          {followUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.handle}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

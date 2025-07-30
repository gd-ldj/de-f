import { Plus } from "lucide-react"
import Image from '@/components/common/react/Image'

const followUsers = [
  { name: "Alessia Fransisca", description: "Writing psychiatrist | Mental health Relationship ...", avatar: "/placeholder.svg", featured: true },
  { name: "Alessia Fransisca", description: "Writing psychiatrist | Mental health Relationship ...", avatar: "/placeholder.svg", featured: false },
  { name: "Alessia Fransisca", description: "Writing psychiatrist | Mental health Relationship ...", avatar: "/placeholder.svg", featured: false },
  { name: "Alessia Fransisca", description: "Writing psychiatrist | Mental health Relationship ...", avatar: "/placeholder.svg", featured: false },
  { name: "Alessia Fransisca", description: "Writing psychiatrist | Mental health Relationship ...", avatar: "/placeholder.svg", featured: false },
]

export default function ToFollowList() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Who To Follow</h3>
        <div className="space-y-4">
          {followUsers.map((user, index) => (
            <div key={index}>
              <div className="flex items-start justify-between py-3">
                <div className="flex items-start space-x-3">
                  <Image src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{user.description}</p>
                  </div>
                </div>
                <div className="group relative flex-shrink-0">
                   <button className="p-1.5 hover:bg-gray-100 rounded transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-95">
                     <Plus className="w-5 h-5 text-gray-600" />
                   </button>
                   <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-all duration-300 ease-in-out items-center space-x-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 absolute right-0 top-0 flex">
                     <Plus className="w-4 h-4" />
                     <span>Subscribe</span>
                   </button>
                 </div>
              </div>
              {index < followUsers.length - 1 && (
                <div className="border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

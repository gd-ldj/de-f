import { Mail } from "lucide-react"
import { Wallet } from '@/components/common/react/ConnectWallet';

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Decentralized Takes.</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Log in or sign up for <span className="font-semibold">DeTake</span>
          <br />
          to get the best <span className="font-semibold">Content</span>
        </p>

        <div className="space-y-3">
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-primary/90">
            <Wallet />
          </button>

          {/* <button className="w-full border border-border text-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-accent">
            <Mail className="w-4 h-4" />
            <span>Continue with Email</span>
          </button> */}
        </div>
      </div>
    </div>
  );
}

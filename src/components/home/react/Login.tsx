import React from 'react';
import { Wallet } from '@/components/common/react/ConnectWallet';

export default function Login() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded border border-border p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Decentralized Takes.</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Log in or sign up for <span className="font-medium">DeTake</span>
          <br />
          to get the best <span className="font-medium">Content</span>
        </p>

        <div className="space-y-3">
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-primary/90">
            <Wallet />
          </button>

          {/*
           * You can re-enable the email option when it's ready
           * <button className="w-full border border-border text-foreground py-2 px-4 rounded flex items-center justify-center space-x-2 hover:bg-accent">
           *   <Mail className="w-4 h-4" />
           *   <span>Continue with Email</span>
           * </button>
           */}
        </div>
      </div>
    </div>
  );
}
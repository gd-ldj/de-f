import React from 'react'
import { useAtom } from 'jotai'
import { persistedPromoteCodeAtom } from '../stores'
import { useWalletAuth } from '../lib/useWalletAuth'
import { DEFAULT_PROMOTE_CODE } from '../config/constants'

/**
 * Example component demonstrating promote code global state management
 * Shows how the promote code defaults to system value and gets replaced after user login
 */
export const PromoteCodeExample: React.FC = () => {
  const [promoteCode, setPromoteCode] = useAtom(persistedPromoteCodeAtom)
  const { isAuthenticated, promoteCode: authPromoteCode } = useWalletAuth()

  const handleResetToDefault = () => {
    setPromoteCode(DEFAULT_PROMOTE_CODE)
  }

  const handleSetCustomCode = () => {
    setPromoteCode('USER123')
  }

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-medium mb-4">Promote Code Management</h2>

      <div className="space-y-4">
        <div className="p-4 bg-secondary rounded">
          <h3 className="font-medium mb-2">Current Promote Code:</h3>
          <p className="text-lg font-mono bg-background p-2 rounded border">{promoteCode}</p>
        </div>

        <div className="p-4 bg-secondary rounded">
          <h3 className="font-medium mb-2">Authentication Status:</h3>
          <p className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-muted-foreground'}`}>{isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
          {isAuthenticated && authPromoteCode && (
            <p className="text-sm text-muted-foreground mt-1">
              Auth Promote Code: <span className="font-mono">{authPromoteCode}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Manual Controls:</h3>
          <div className="flex gap-2">
            <button onClick={handleResetToDefault} className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors">
              Reset to Default ({DEFAULT_PROMOTE_CODE})
            </button>
            <button onClick={handleSetCustomCode} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
              Set Custom Code (USER123)
            </button>
          </div>
        </div>

        <div className="p-4 bg-secondary rounded border-l-4 border-yellow-400">
          <h3 className="font-medium mb-2">How it works:</h3>
          <ul className="text-sm space-y-1 text-foreground">
            <li>
              • System starts with default promote code: <code className="bg-background px-1 rounded">{DEFAULT_PROMOTE_CODE}</code>
            </li>
            <li>• When user logs in with wallet, their promote code replaces the default</li>
            <li>• Promote code is persisted in localStorage and global state</li>
            <li>• When user logs out, promote code resets to default value</li>
            <li>• API calls use the current promote code from global state</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PromoteCodeExample
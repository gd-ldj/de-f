import React, { useState } from 'react'
import { useAuth } from '../lib/useAuth'

/**
 * Example component demonstrating wallet authentication usage
 * Shows how to integrate wallet login with signature and global state management
 */
export const WalletAuthExample: React.FC = () => {
  const {
    // Privy authentication
    ready,
    authenticated,
    login,
    logout,
    user,
    
    // Wallet authentication
    walletLogin,
    isWalletAuthenticated,
    walletAuthData,
    accessToken,
    userId,
    walletAddress,
    
    // Combined states
    isFullyAuthenticated,
    isLoading,
    error,
    
    // Utility methods
    getValidAccessToken,
    clearWalletAuthError
  } = useAuth()
  
  const [signature, setSignature] = useState('')
  const [loginStatus, setLoginStatus] = useState<string>('')

  /**
   * Handle wallet signature and login
   */
  const handleWalletSignatureLogin = async () => {
    if (!walletAddress || !signature) {
      setLoginStatus('Please connect wallet and provide signature')
      return
    }

    setLoginStatus('Logging in...')
    
    try {
      const success = await walletLogin(walletAddress, signature)
      
      if (success) {
        setLoginStatus('Wallet login successful!')
        setSignature('') // Clear signature input
      } else {
        setLoginStatus('Wallet login failed')
      }
    } catch (error) {
      setLoginStatus(`Login error: ${error}`)
    }
  }

  /**
   * Test API call with access token
   */
  const testApiCall = async () => {
    try {
      const token = await getValidAccessToken()
      if (token) {
        setLoginStatus(`Valid access token available: ${token.substring(0, 20)}...`)
        // Here you would make your authenticated API call
        // Example: await fetchUserPersonalInfo(userId)
      } else {
        setLoginStatus('No valid access token available')
      }
    } catch (error) {
      setLoginStatus(`Token error: ${error}`)
    }
  }

  /**
   * Handle complete logout
   */
  const handleCompleteLogout = async () => {
    setLoginStatus('Logging out...')
    await logout()
    setLoginStatus('Logged out successfully')
  }

  if (!ready) {
    return <div className="p-4">Loading Privy...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Wallet Authentication Example</h2>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        <div className="space-y-2 text-sm">
          <div>Privy Ready: <span className={ready ? 'text-green-600' : 'text-red-600'}>{ready ? 'Yes' : 'No'}</span></div>
          <div>Privy Authenticated: <span className={authenticated ? 'text-green-600' : 'text-red-600'}>{authenticated ? 'Yes' : 'No'}</span></div>
          <div>Wallet Authenticated: <span className={isWalletAuthenticated ? 'text-green-600' : 'text-red-600'}>{isWalletAuthenticated ? 'Yes' : 'No'}</span></div>
          <div>Fully Authenticated: <span className={isFullyAuthenticated ? 'text-green-600' : 'text-red-600'}>{isFullyAuthenticated ? 'Yes' : 'No'}</span></div>
          <div>Loading: <span className={isLoading ? 'text-yellow-600' : 'text-gray-600'}>{isLoading ? 'Yes' : 'No'}</span></div>
          {error && <div className="text-red-600">Error: {error}</div>}
        </div>
      </div>

      {/* User Information */}
      {(walletAddress || userId) && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">User Information</h3>
          <div className="space-y-2 text-sm">
            {walletAddress && <div>Wallet Address: <code className="bg-gray-200 px-2 py-1 rounded">{walletAddress}</code></div>}
            {userId && <div>User ID: <code className="bg-gray-200 px-2 py-1 rounded">{userId}</code></div>}
            {accessToken && (
              <div>Access Token: <code className="bg-gray-200 px-2 py-1 rounded">{accessToken.substring(0, 30)}...</code></div>
            )}
            {walletAuthData?.accessTokenExpiresAt && (
              <div>Token Expires: <code className="bg-gray-200 px-2 py-1 rounded">{new Date(walletAuthData.accessTokenExpiresAt).toLocaleString()}</code></div>
            )}
          </div>
        </div>
      )}

      {/* Authentication Actions */}
      <div className="space-y-4">
        {!authenticated ? (
          <button
            onClick={login}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Connect Wallet (Privy)
          </button>
        ) : (
          <div className="space-y-4">
            {!isWalletAuthenticated && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter wallet signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleWalletSignatureLogin}
                  disabled={isLoading || !signature}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Login with Wallet Signature
                </button>
              </div>
            )}
            
            {isWalletAuthenticated && (
              <div className="space-y-2">
                <button
                  onClick={testApiCall}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Test API Call with Token
                </button>
                
                <button
                  onClick={handleCompleteLogout}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Complete Logout
                </button>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <button
            onClick={clearWalletAuthError}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Error
          </button>
        )}
      </div>

      {/* Status Messages */}
      {loginStatus && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{loginStatus}</p>
        </div>
      )}
    </div>
  )
}

export default WalletAuthExample
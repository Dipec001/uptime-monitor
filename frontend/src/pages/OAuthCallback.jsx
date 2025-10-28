// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';

function OAuthCallback() {
  useEffect(() => {
    try {
      // Google returns token in URL hash: #access_token=xxxxx&state=...
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      
      // GitHub returns code in query string: ?code=xxxxx&state=...
      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');
      const error = query.get('error');

      // Get state (contains provider info)
      const stateParam = hashParams.get('state') || query.get('state');
      let provider = 'google'; // default
      
      if (stateParam) {
        try {
          const state = JSON.parse(decodeURIComponent(stateParam));
          provider = state.provider;
        } catch (e) {
          console.error('Failed to parse state:', e);
        }
      }
      
      // Check if there's an error
      if (error) {
        window.opener?.postMessage({
          type: 'oauth-error',
          error: error
        }, window.location.origin);
        window.close();
        return;
      }
      
      // Send token/code AND provider back to parent window
      if (accessToken || code) {
        window.opener?.postMessage({
          type: 'oauth-success',
          accessToken: accessToken || code,
          provider: provider // ✅ Added provider to the message
        }, window.location.origin);
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        // No token found
        window.opener?.postMessage({
          type: 'oauth-error',
          error: 'No access token received'
        }, window.location.origin);
        window.close();
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      window.opener?.postMessage({
        type: 'oauth-error',
        error: err.message
      }, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
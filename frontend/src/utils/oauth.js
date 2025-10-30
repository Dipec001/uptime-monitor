// src/utils/oauth.js

export const loginWithGoogle = () => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const scope = 'email profile';
    const state = JSON.stringify({ provider: 'google' });

    if (!clientId) {
      reject(new Error('Google Client ID not configured'));
      return;
    }
    
    // ✅ ADD &state= to the URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&state=${encodeURIComponent(state)}&prompt=select_account`;
    
    const popup = window.open(
      googleAuthUrl,
      'Google Login',
      'width=500,height=600'
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }
    
    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth-success') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve({
          accessToken: event.data.accessToken,
          provider: event.data.provider
        });
      } else if (event.data.type === 'oauth-error') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error));
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        reject(new Error('Login cancelled'));
      }
    }, 1000);
  });
};

export const loginWithGithub = () => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const state = JSON.stringify({ provider: 'github' });

    if (!clientId) {
      reject(new Error('GitHub Client ID not configured'));
      return;
    }
    
    // ✅ ADD &state= to the URL
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email&state=${encodeURIComponent(state)}`;
    
    const popup = window.open(
      githubAuthUrl,
      'GitHub Login',
      'width=500,height=600'
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }
    
    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth-success') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve({
          accessToken: event.data.accessToken,
          provider: event.data.provider
        });
      } else if (event.data.type === 'oauth-error') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error));
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        reject(new Error('Login cancelled'));
      }
    }, 1000);
  });
};
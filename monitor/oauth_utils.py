# ============================================
# Token Verification
# ============================================
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings


class GoogleAuthError(Exception):
    pass


class GitHubAuthError(Exception):
    pass


def verify_google_token(token):
    """
    Verify Google OAuth token and return user info
    """
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.GOOGLE_OAUTH_CLIENT_ID
        )
        
        # Token is valid, extract user info
        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'first_name': idinfo.get('given_name', ''),
            'last_name': idinfo.get('family_name', ''),
            'avatar': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False)
        }
    except ValueError as e:
        raise GoogleAuthError(f"Invalid token: {str(e)}")


def verify_github_token(access_token):
    """
    Verify GitHub OAuth token and return user info
    """
    try:
        # Get user info from GitHub API
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
        
        # Get user profile
        user_response = requests.get(
            'https://api.github.com/user',
            headers=headers,
            timeout=10
        )
        
        if user_response.status_code != 200:
            raise GitHubAuthError("Failed to fetch user info from GitHub")
        
        user_data = user_response.json()
        
        # Get primary email (GitHub doesn't always return email in profile)
        email = user_data.get('email')
        if not email:
            email_response = requests.get(
                'https://api.github.com/user/emails',
                headers=headers,
                timeout=10
            )
            if email_response.status_code == 200:
                emails = email_response.json()
                # Get primary verified email
                for e in emails:
                    if e.get('primary') and e.get('verified'):
                        email = e['email']
                        break
        
        if not email:
            raise GitHubAuthError("No verified email found in GitHub account")
        
        # Parse name
        name = user_data.get('name', '').split(' ', 1) if user_data.get('name') else ['', '']
        
        return {
            'github_id': str(user_data['id']),
            'email': email,
            'first_name': name[0] if name else '',
            'last_name': name[1] if len(name) > 1 else '',
            'avatar': user_data.get('avatar_url', ''),
            'username': user_data.get('login', '')
        }
    except requests.RequestException as e:
        raise GitHubAuthError(f"GitHub API error: {str(e)}")
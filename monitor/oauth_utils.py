import requests


class GoogleAuthError(Exception):
    pass


class GitHubAuthError(Exception):
    pass


def verify_google_token(token):
    """
    Verify Google OAuth token and return user info
    """
    
    try:
        response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        # Check if request was successful
        if response.status_code != 200:
            raise GoogleAuthError(f"Failed to fetch user info: {response.text}")
        
        user_info = response.json()
        print("User Info:", user_info)  # Debugging line
        
        # Token is valid, extract user info
        return {
            'google_id': user_info['id'],
            'email': user_info['email'],
            'first_name': user_info.get('given_name', ''),
            'last_name': user_info.get('family_name', ''),
            'avatar': user_info.get('picture', ''),
            'email_verified': user_info.get('verified_email', False)
        }
    except requests.exceptions.RequestException as e:
        raise GoogleAuthError(f"Network error: {str(e)}")
    except (KeyError, ValueError) as e:
        raise GoogleAuthError(f"Invalid response format: {str(e)}")


def verify_github_token(access_token):
    """
    Verify GitHub OAuth token and return user info
    """
    try:
        # Get user info from GitHub API
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/vnd.github.v3+json'
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
        name_parts = user_data.get('name', '').split(' ', 1) if user_data.get('name') else []
        
        return {
            'github_id': str(user_data['id']),
            'email': email,
            'first_name': name_parts[0] if name_parts else '',
            'last_name': name_parts[1] if len(name_parts) > 1 else '',
            'avatar': user_data.get('avatar_url', ''),
            'username': user_data.get('login', ''),
            'email_verified': True  # GitHub emails from /user/emails are already verified
        }
    except requests.RequestException as e:
        raise GitHubAuthError(f"GitHub API error: {str(e)}")

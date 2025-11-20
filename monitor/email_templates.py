"""
Email templates for Alive Checks
Modern, clean design matching the website aesthetic
"""

def get_email_header():
    """Common header for all emails"""
    return """
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="display: inline-block; background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 12px; margin-bottom: 15px;">
            <img src="https://video-play-api-bucket.s3.eu-north-1.amazonaws.com/UnionLogo+(1).png" alt="Alive Checks Logo" style="width: 48px; height: 48px; display: block;" />
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Alive Checks</h1>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Keeping your sites alive 24/7</p>
    </div>
    """


def get_email_footer():
    """Common footer for all emails"""
    return """
    <div style="background: #1e293b; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px; margin-top: 30px;">
        <p style="color: #64748b; font-size: 13px; margin: 0 0 10px 0;">
            You're receiving this because you monitor this service with Alive Checks
        </p>
        <p style="color: #64748b; font-size: 12px; margin: 0;">
            <a href="https://alivechecks.com/dashboard" style="color: #3b82f6; text-decoration: none;">Manage Alerts</a> •  
            <a href="mailto:support@alivechecks.com" style="color: #3b82f6; text-decoration: none;">Support</a>
        </p>
        <p style="color: #475569; font-size: 11px; margin: 15px 0 0 0;">
            © 2024 Alive Checks. All rights reserved.
        </p>
    </div>
    """

def get_base_template(content):
    """Base email template wrapper"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alive Checks Alert</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
                        <tr>
                            <td>
                                {get_email_header()}
                                {content}
                                {get_email_footer()}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


# ============================================
# WEBSITE MONITORING EMAILS
# ============================================

def website_downtime_email(website_name, website_url, status_code, error_message, downtime_start):
    """Email template for website downtime alert"""
    content = f"""
    <div style="padding: 40px 30px;">
        <!-- Alert Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 50%; padding: 20px;">
                <span style="font-size: 48px;">🚨</span>
            </div>
        </div>
        
        <!-- Main Message -->
        <h2 style="color: #ef4444; text-align: center; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
            Website is DOWN
        </h2>
        <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 30px 0;">
            We detected an issue with your monitored website
        </p>
        
        <!-- Details Card -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">MONITOR NAME</p>
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">{website_name}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">URL</p>
                <p style="color: #3b82f6; font-size: 14px; margin: 0; word-break: break-all;">
                    <a href="{website_url}" style="color: #3b82f6; text-decoration: none;">{website_url}</a>
                </p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">STATUS CODE</p>
                <p style="color: #ef4444; font-size: 16px; font-weight: 600; margin: 0;">{status_code if status_code else 'N/A'}</p>
            </div>
            
            {f'''
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">ERROR DETAILS</p>
                <p style="color: #f87171; font-size: 14px; margin: 0; background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; font-family: monospace;">{error_message}</p>
            </div>
            ''' if error_message else ''}
            
            <div>
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">DETECTED AT</p>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0;">🕒 {downtime_start}</p>
            </div>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://alivechecks.com/dashboard" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
                View Dashboard →
            </a>
        </div>
        
        <!-- Help Text -->
        <div style="background: rgba(59, 130, 246, 0.05); border-left: 3px solid #3b82f6; padding: 15px 20px; border-radius: 6px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong style="color: #e2e8f0;">What's next?</strong><br>
                We'll keep monitoring and notify you immediately when your website recovers. You can also check your dashboard for detailed uptime history and logs.
            </p>
        </div>
    </div>
    """
    return get_base_template(content)


def website_recovery_email(website_name, website_url, downtime_duration, recovered_at):
    """Email template for website recovery alert"""
    content = f"""
    <div style="padding: 40px 30px;">
        <!-- Success Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; border-radius: 50%; padding: 20px;">
                <span style="font-size: 48px;">✅</span>
            </div>
        </div>
        
        <!-- Main Message -->
        <h2 style="color: #22c55e; text-align: center; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
            Website is BACK UP!
        </h2>
        <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 30px 0;">
            Your website is responding normally again 🎉
        </p>
        
        <!-- Details Card -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">MONITOR NAME</p>
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">{website_name}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">URL</p>
                <p style="color: #3b82f6; font-size: 14px; margin: 0; word-break: break-all;">
                    <a href="{website_url}" style="color: #3b82f6; text-decoration: none;">{website_url}</a>
                </p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">DOWNTIME DURATION</p>
                <p style="color: #fbbf24; font-size: 16px; font-weight: 600; margin: 0;">⏱️ {downtime_duration}</p>
            </div>
            
            <div>
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">RECOVERED AT</p>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0;">🕒 {recovered_at}</p>
            </div>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://alivechecks.com/dashboard" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.3);">
                View Details →
            </a>
        </div>
        
        <!-- Info Box -->
        <div style="background: rgba(34, 197, 94, 0.05); border-left: 3px solid #22c55e; padding: 15px 20px; border-radius: 6px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong style="color: #e2e8f0;">All systems operational</strong><br>
                Your website is now responding with normal status codes. We'll continue monitoring 24/7.
            </p>
        </div>
    </div>
    """
    return get_base_template(content)


# ============================================
# HEARTBEAT MONITORING EMAILS
# ============================================

def heartbeat_missed_email(heartbeat_name, expected_interval, last_ping, missed_at):
    """Email template for missed heartbeat alert"""
    content = f"""
    <div style="padding: 40px 30px;">
        <!-- Alert Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 50%; padding: 20px;">
                <span style="font-size: 48px;">💔</span>
            </div>
        </div>
        
        <!-- Main Message -->
        <h2 style="color: #ef4444; text-align: center; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
            Heartbeat MISSED
        </h2>
        <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 30px 0;">
            Your scheduled job or service didn't check in
        </p>
        
        <!-- Details Card -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">MONITOR NAME</p>
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">{heartbeat_name}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">EXPECTED INTERVAL</p>
                <p style="color: #e2e8f0; font-size: 16px; font-weight: 600; margin: 0;">⏰ {expected_interval}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">LAST SUCCESSFUL PING</p>
                <p style="color: #fbbf24; font-size: 14px; margin: 0;">{last_ping if last_ping else 'Never'}</p>
            </div>
            
            <div>
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">MISSED AT</p>
                <p style="color: #ef4444; font-size: 14px; margin: 0;">🕒 {missed_at}</p>
            </div>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://alivechecks.com/dashboard" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
                Investigate Issue →
            </a>
        </div>
        
        <!-- Help Text -->
        <div style="background: rgba(59, 130, 246, 0.05); border-left: 3px solid #3b82f6; padding: 15px 20px; border-radius: 6px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong style="color: #e2e8f0;">Possible causes:</strong><br>
                • Cron job failed to execute<br>
                • Service crashed or stopped<br>
                • Network connectivity issues<br>
                • Script execution timeout
            </p>
        </div>
    </div>
    """
    return get_base_template(content)


def heartbeat_recovery_email(heartbeat_name, missed_duration, recovered_at):
    """Email template for heartbeat recovery alert"""
    content = f"""
    <div style="padding: 40px 30px;">
        <!-- Success Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; border-radius: 50%; padding: 20px;">
                <span style="font-size: 48px;">💚</span>
            </div>
        </div>
        
        <!-- Main Message -->
        <h2 style="color: #22c55e; text-align: center; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
            Heartbeat RECOVERED
        </h2>
        <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 30px 0;">
            Your service is checking in normally again 🎉
        </p>
        
        <!-- Details Card -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">MONITOR NAME</p>
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">{heartbeat_name}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">OFFLINE DURATION</p>
                <p style="color: #fbbf24; font-size: 16px; font-weight: 600; margin: 0;">⏱️ {missed_duration}</p>
            </div>
            
            <div>
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">RECOVERED AT</p>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0;">🕒 {recovered_at}</p>
            </div>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://alivechecks.com/dashboard" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.3);">
                View Ping History →
            </a>
        </div>
        
        <!-- Info Box -->
        <div style="background: rgba(34, 197, 94, 0.05); border-left: 3px solid #22c55e; padding: 15px 20px; border-radius: 6px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong style="color: #e2e8f0;">All systems operational</strong><br>
                Your heartbeat monitor received a successful ping. We'll continue monitoring for any interruptions.
            </p>
        </div>
    </div>
    """
    return get_base_template(content)


# ============================================
# TEST NOTIFICATION EMAIL
# ============================================

def test_notification_email(user_name, monitor_name):
    """Generic test notification email - works for any monitor type"""
    content = f"""
    <div style="padding: 40px 30px;">
        <!-- Test Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: rgba(139, 92, 246, 0.1); border: 2px solid #8b5cf6; border-radius: 50%; padding: 20px;">
                <span style="font-size: 48px;">🔔</span>
            </div>
        </div>
        
        <!-- Main Message -->
        <h2 style="color: #8b5cf6; text-align: center; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
            Test Alert
        </h2>
        <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 30px 0;">
            Testing email notifications for your monitor
        </p>
        
        <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 25px 0;">Hi {user_name},</p>
        
        <!-- Details Card -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <div style="margin-bottom: 20px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">MONITOR</p>
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">{monitor_name}</p>
            </div>
            
            <div>
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">TEST TYPE</p>
                <p style="color: #e2e8f0; font-size: 14px; margin: 0;">Email Notification Test</p>
            </div>
        </div>
        
        <!-- Success Message -->
        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <p style="color: #22c55e; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">✅ Email alerts are working!</p>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                When issues are detected, you'll receive alerts at this email address with full details and quick access to your dashboard.
            </p>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center;">
            <a href="https://alivechecks.com/dashboard" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
                View Dashboard →
            </a>
        </div>
    </div>
    """
    return get_base_template(content)


# ============================================
# ACCOUNT EMAILS
# ============================================

def welcome_email(user_name):
    """Welcome email for new users"""
    content = f"""
    <div style="padding: 40px 30px;">
        <!-- Welcome Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 64px;">🎉</span>
        </div>
        
        <!-- Main Message -->
        <h2 style="color: #ffffff; text-align: center; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
            Welcome to Alive Checks!
        </h2>
        <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 30px 0;">
            You're all set to start monitoring your websites
        </p>
        
        <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 25px 0;">Hi {user_name},</p>
        
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            Thanks for signing up! You're now ready to monitor your websites and get instant alerts when they go down.
        </p>
        
        <!-- Getting Started Steps -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">🚀 Getting Started</h3>
            
            <div style="margin-bottom: 15px;">
                <div style="display: inline-block; background: #3b82f6; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; margin-right: 12px;">1</div>
                <span style="color: #e2e8f0; font-size: 14px; font-weight: 600;">Add your first website to monitor</span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="display: inline-block; background: #3b82f6; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; margin-right: 12px;">2</div>
                <span style="color: #e2e8f0; font-size: 14px; font-weight: 600;">Configure your alert preferences</span>
            </div>
            
            <div>
                <div style="display: inline-block; background: #3b82f6; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; margin-right: 12px;">3</div>
                <span style="color: #e2e8f0; font-size: 14px; font-weight: 600;">Relax - we'll watch your sites 24/7</span>
            </div>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://alivechecks.com/dashboard" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
                Go to Dashboard →
            </a>
        </div>
        
        <!-- Help Text -->
        <div style="background: rgba(59, 130, 246, 0.05); border-left: 3px solid #3b82f6; padding: 15px 20px; border-radius: 6px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong style="color: #e2e8f0;">Need help?</strong><br>
                Check out our documentation or contact us at support@alivechecks.com. We're here to help!
            </p>
        </div>
    </div>
    """
    return get_base_template(content)


def password_reset_email(user_name, reset_link):
    """Password reset email"""
    content = f"""
    <div style="padding: 40px 30px;">
        <!-- Security Badge -->
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: rgba(251, 191, 36, 0.1); border: 2px solid #fbbf24; border-radius: 50%; padding: 20px;">
                <span style="font-size: 48px;">🔐</span>
            </div>
        </div>
        
        <!-- Main Message -->
        <h2 style="color: #fbbf24; text-align: center; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
            Password Reset Request
        </h2>
        <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 30px 0;">
            We received a request to reset your password
        </p>
        
        <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 25px 0;">Hi {user_name},</p>
        
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            Someone requested a password reset for your Alive Checks account. If this was you, click the button below to reset your password:
        </p>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 25px;">
            <a href="{reset_link}" style="display: inline-block; background: #fbbf24; color: #0f172a; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(251, 191, 36, 0.3);">
                Reset Password →
            </a>
        </div>
        
        <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0 0 25px 0;">
            This link will expire in 24 hours for security reasons.
        </p>
        
        <!-- Warning Box -->
        <div style="background: rgba(239, 68, 68, 0.05); border-left: 3px solid #ef4444; padding: 15px 20px; border-radius: 6px;">
            <p style="color: #f87171; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong style="color: #ef4444;">⚠️ Didn't request this?</strong><br>
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
        </div>
    </div>
    """
    return get_base_template(content)
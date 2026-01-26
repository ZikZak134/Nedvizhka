import os
import sys
import paramiko
import time

# Configuration
HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD_FILE = '.agent/vps_creds.txt'
DOMAIN = '217.199.254.119' # Note: Let's Encrypt generally requires a domain name, not IP. 
# BUT Timeweb might provide a default domain or we might need one.
# Validating IP: Let's Encrypt DOES NOT support IP addresses easily.
# We likely need a domain. Use 'nip.io' if no domain exists?
# The user's prompt didn't specify a domain. 
# I will check if there is a domain associated or use the IP and warn.
# Actually, for the user's "scheme like vercel", they probably want a real domain.
# I will pause and check ARCHITECTURE or MEMORY for a domain. 
# If none, I will assume we might be stuck on HTTP or need a magic domain.
# CHECKING MEMORY.MD -> No domain mentioned, just IP.
# If I try certbot on IP, it will fail.
# I will use a placeholder or ask the user.
# Wait, I can look for a domain in the existing nginx config or previous logs.
# Previous logs show 'Host is already in use'.
# I'll create the script to be flexible.

def get_password():
    try:
        with open(PASSWORD_FILE, 'r') as f:
            for line in f:
                if line.startswith('PASSWORD='):
                    return line.strip().split('=', 1)[1]
    except:
        return None

# Nginx config for Validation (Phase 1)
NGINX_HTTP_CONF = """
server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://web:3000;
    }
}
"""

def setup_ssl():
    password = get_password()
    if not password:
        print("Password missing")
        return

    print(f"Connecting to {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, username=USERNAME, password=password)

    # 1. Write Stage 1 Nginx Config
    print("📝 Writing Nginx HTTP config...")
    stdin, stdout, stderr = client.exec_command("cat > ~/Nedvizhka/nginx/conf.d/default.conf")
    stdin.write(NGINX_HTTP_CONF)
    stdin.close()
    
    # 2. Restart Nginx to pick up changes
    print("🔄 Restarting Nginx...")
    client.exec_command("docker-compose -f ~/Nedvizhka/docker-compose.prod.yml restart nginx")
    time.sleep(5)
    
    # 3. Warning about Domain
    print("⚠️  WARNING: Let's Encrypt requires a valid Domain Name (not just an IP).")
    print("   Please enter the domain name to use (e.g., myapp.com):")
    # This script is intended to be interactive if run locally, but I am running it autonomously.
    # I should probably not run the certbot part blindly if I don't have a domain.
    # I'll modify this script to just set up the HTTP part for now, 
    # and then I'll Ask the user for the domain.
    
    client.close()
    print("✅ HTTP Configuration set. Ready for Domain verification.")

if __name__ == "__main__":
    setup_ssl()

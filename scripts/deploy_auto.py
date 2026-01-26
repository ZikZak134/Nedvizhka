import paramiko
import time
import os
import sys

# Configuration
HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD_FILE = '.agent/vps_creds.txt'

def get_password():
    """Reads password from the creds file."""
    try:
        with open(PASSWORD_FILE, 'r') as f:
            for line in f:
                if line.startswith('PASSWORD='):
                    return line.strip().split('=', 1)[1]
    except Exception as e:
        print(f"Error reading password file: {e}")
        sys.exit(1)
    return None

def deploy():
    password = get_password()
    if not password:
        print("Password not found in credentials file.")
        sys.exit(1)

    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    
    try:
        # Get Yandex Key from local .env
        yandex_key = ""
        try:
            with open('apps/web/.env', 'r') as f:
                for line in f:
                    if line.startswith('NEXT_PUBLIC_YANDEX_MAPS_KEY='):
                        yandex_key = line.strip().split('=', 1)[1]
                        break
        except Exception:
            print("⚠️ Could not read NEXT_PUBLIC_YANDEX_MAPS_KEY from apps/web/.env")

        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=password)
        
        print("✅ Connected successfully.")
        
        # Check if directory exists
        check_dir_cmd = "[ -d ~/Nedvizhka ] && echo 'EXISTS' || echo 'MISSING'"
        stdin, stdout, stderr = client.exec_command(check_dir_cmd)
        dir_status = stdout.read().decode().strip()
        
        commands = []
        
        if dir_status == 'MISSING':
            print("📂 Directory not found. Cloning repository...")
            commands.append("git clone https://github.com/ZikZak134/Nedvizhka.git ~/Nedvizhka")
        else:
             print("📂 Directory exists.")

        # Build env string
        env_vars = f"export NEXT_PUBLIC_YANDEX_MAPS_KEY={yandex_key}" if yandex_key else ""

        commands.extend([
            "cd ~/Nedvizhka",
            
            # Safely remove containers if they exist
            "if [ -n \"$(docker ps -aq)\" ]; then docker rm -f $(docker ps -aq); fi",
            
            "git fetch origin",
            "git reset --hard origin/main",
            f"{env_vars} && docker-compose -f docker-compose.prod.yml up -d --build"
        ])
        
        full_command = " && ".join(commands)
        print(f"Executing deployment with Yandex Key: {yandex_key[:5]}...")
        
        stdin, stdout, stderr = client.exec_command(full_command)
        
        # Stream output
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())
            
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("\n✅ Deployment completed successfully!")
        else:
            print(f"\n❌ Deployment failed with exit code {exit_status}")
            print("Error output:")
            print(stderr.read().decode())
            
        client.close()
        
    except Exception as e:
        print(f"❌ Connection or Execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    deploy()

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

        commands.extend([
            "cd ~/Nedvizhka",
            
            # NUKE OPTION: Remove all running containers to free ports from old project names
            "docker rm -f $(docker ps -aq) || true",
            
            "git fetch origin",
            "git reset --hard origin/main",
            "docker-compose -f docker-compose.prod.yml up -d --build --force-recreate"
        ])
        
        full_command = " && ".join(commands)
        print(f"Executing: {full_command}")
        
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
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    deploy()

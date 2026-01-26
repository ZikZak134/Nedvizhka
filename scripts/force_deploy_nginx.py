import paramiko
import sys
import time

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def force_deploy_nginx_nodeps():
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        print("✅ Connected.")

        commands = [
            "cd ~/Nedvizhka",
            # Start nginx with no-deps
            "echo 'Starting nginx (no-deps)...'",
            "docker-compose -f docker-compose.prod.yml up -d --no-deps nginx",
            "sleep 5",
            "docker ps",
        ]

        full_command = " && ".join(commands)
        print(f"Executing: {full_command}")
        
        stdin, stdout, stderr = client.exec_command(full_command)
        
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())
            
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("\n✅ Nginx Started Successfully!")
        else:
            print(f"\n❌ Nginx Start failed with exit code {exit_status}")
            print(stderr.read().decode())
            
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    force_deploy_nginx_nodeps()

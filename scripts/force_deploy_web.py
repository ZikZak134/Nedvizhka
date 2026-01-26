import paramiko
import sys
import time

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def force_deploy():
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        print("✅ Connected.")

        commands = [
            "cd ~/Nedvizhka",
            # Find and remove web container
            "echo 'Stopping web containers...'",
            "docker ps -a | grep web | awk '{print $1}' | xargs -r docker rm -f",
            # Prune to be safe
            "docker system prune -f",
            # Build and up
            "echo 'Building and starting web...'",
            "docker-compose -f docker-compose.prod.yml up -d --build --force-recreate web",
            "docker-compose -f docker-compose.prod.yml restart nginx"
        ]

        full_command = " && ".join(commands)
        print(f"Executing: {full_command}")
        
        stdin, stdout, stderr = client.exec_command(full_command, get_pty=True)
        
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())
            
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("\n✅ Force Deployment completed successfully!")
        else:
            print(f"\n❌ Force Deployment failed with exit code {exit_status}")
            print(stderr.read().decode())
            
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    force_deploy()

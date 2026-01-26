import paramiko
import os
import sys

HOSTNAME = '217.199.254.119'
USERNAME = 'root'

def get_password():
    return 'y#+h5u@XcC@QN9'

def deploy_patch():
    password = get_password()
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=password)
        
        sftp = client.open_sftp()
        
        # 1. Upload docker-compose.prod.yml
        print("Uploading docker-compose.prod.yml...")
        local_dc = 'docker-compose.prod.yml'
        remote_dc = '/root/Nedvizhka/docker-compose.prod.yml'
        sftp.put(local_dc, remote_dc)
        
        # 2. Upload next.config.js
        print("Uploading apps/web/next.config.js...")
        local_conf = 'apps/web/next.config.js'
        remote_conf = '/root/Nedvizhka/apps/web/next.config.js'
        sftp.put(local_conf, remote_conf)
        
        sftp.close()
        
        # 3. Rebuild
        print("Triggering rebuild...")
        # Note: We do NOT run git reset here, so our patched files stay
        # We need to rebuild 'web' container to bake in the new NEXT_PUBLIC_API_URL arg
        commands = [
            "cd ~/Nedvizhka",
            "docker-compose -f docker-compose.prod.yml up -d --build --no-deps web",
            # Restart nginx just in case, though not strictly needed if config didn't change
            "docker-compose -f docker-compose.prod.yml restart nginx"
        ]
        
        full_command = " && ".join(commands)
        
        stdin, stdout, stderr = client.exec_command(full_command)
        
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())
            
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("\n✅ Patch Deployment completed successfully!")
        else:
            print(f"\n❌ Patch Deployment failed with exit code {exit_status}")
            print(stderr.read().decode())
            
        client.close()

    except Exception as e:
        print(f"❌ Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    deploy_patch()

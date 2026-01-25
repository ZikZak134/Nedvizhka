
import paramiko
import os
import time

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

def hotfix_frontend():
    print(f"Connecting to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    # 1. Upload fixed file
    local_file = "apps/web/app/admin/components/AuthGuard.tsx"
    remote_file = f"{REMOTE_PATH}/apps/web/app/admin/components/AuthGuard.tsx"
    
    print(f"Uploading {local_file}...")
    sftp = ssh.open_sftp()
    try:
        sftp.put(local_file, remote_file)
        print("File uploaded successfully.")
    except Exception as e:
        print(f"Upload failed: {e}")
        return

    sftp.close()
    
    # 2. Rebuild and restart web container
    print("Rebuilding web container (this may take a few minutes)...")
    
    # Using nohup or just waiting? Build might take time.
    # Let's try synchronous, knowing it might timeout if > 10m?
    # Usually nextjs build takes 1-2 mins.
    
    cmd = f"cd {REMOTE_PATH} && docker-compose -f docker-compose.prod.yml up -d --build web"
    print(f"Executing: {cmd}")
    
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Stream output
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line.strip())
        
    err = stderr.read().decode()
    if err:
        print(f"STDERR: {err}")
        
    print("Deployment command finished.")
    ssh.close()

if __name__ == "__main__":
    hotfix_frontend()

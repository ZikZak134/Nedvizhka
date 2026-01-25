import paramiko
import os

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_BASE = "/opt/estate-analytics"

def update_configs():
    print(f"Updating configs on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    
    files = [
        ('apps/api/Dockerfile', f'{REMOTE_BASE}/apps/api/Dockerfile'),
        ('apps/web/Dockerfile', f'{REMOTE_BASE}/apps/web/Dockerfile'),
        ('docker-compose.prod.yml', f'{REMOTE_BASE}/docker-compose.prod.yml')
    ]

    for local, remote in files:
        if os.path.exists(local):
            print(f"Uploading {local} -> {remote}")
            sftp.put(local, remote)
    
    sftp.close()
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    update_configs()

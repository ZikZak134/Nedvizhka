import paramiko
import os

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics/apps/web"

def update_web_dockerfile():
    print(f"Updating apps/web/Dockerfile on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    
    f = 'apps/web/Dockerfile'
    if os.path.exists(f):
        # We need to upload to specific path
        local_path = f
        remote_file = f"{REMOTE_PATH}/Dockerfile"
        print(f"Uploading {local_path} to {remote_file}")
        sftp.put(local_path, remote_file)
    
    sftp.close()
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    update_web_dockerfile()

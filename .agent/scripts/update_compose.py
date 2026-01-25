import paramiko
import os

# Credentials
HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

def update_compose():
    print(f"Updating docker-compose on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    
    f = 'docker-compose.prod.yml'
    if os.path.exists(f):
        print(f"Uploading {f}")
        sftp.put(f, f"{REMOTE_PATH}/{f}")
    
    sftp.close()
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    update_compose()

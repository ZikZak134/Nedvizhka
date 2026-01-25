import paramiko
import os
import sys

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

def upload_service():
    print(f"Uploading patched property_service.py to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    
    f = 'apps/api/app/services/property_service.py'
    remote_file = f"{REMOTE_PATH}/{f}"
    
    if os.path.exists(f):
        print(f"Uploading {f} to {remote_file}")
        sftp.put(f, remote_file)
    
    sftp.close()
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    upload_service()

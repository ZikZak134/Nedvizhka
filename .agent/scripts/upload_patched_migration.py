import paramiko
import os
import sys

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

def upload_migration():
    print(f"Uploading patched migration to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    
    f = 'apps/api/alembic/versions/8e9f1a2b3c4d_add_developer_properties_fields.py'
    if os.path.exists(f):
        remote_file = f"{REMOTE_PATH}/{f}"
        print(f"Uploading {f} to {remote_file}")
        sftp.put(f, remote_file)
    
    sftp.close()
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    upload_migration()

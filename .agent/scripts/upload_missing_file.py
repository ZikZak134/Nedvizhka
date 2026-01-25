import paramiko
import os
import sys

# Credentials
HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

def upload_file(local_path, remote_subpath):
    print(f"Uploading {local_path} to {HOST}:{REMOTE_PATH}/{remote_subpath}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    
    remote_full = f"{REMOTE_PATH}/{remote_subpath}"
    
    # Ensure dir exists
    dirname = os.path.dirname(remote_full)
    try:
        sftp.stat(dirname)
    except IOError:
        print(f"Creating dir {dirname}")
        # Simple mkdir, might fail if parent missing but unlikely for this specific case
        try:
            sftp.mkdir(dirname)
        except:
            pass
            
    sftp.put(local_path, remote_full)
    
    sftp.close()
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        # Default fixed behavior for this step
        upload_file(
            r"apps\web\app\admin\components\Section.tsx", 
            "apps/web/app/admin/components/Section.tsx"
        )
    else:
        upload_file(sys.argv[1], sys.argv[2])

import paramiko
import os
import sys
import errno
from stat import S_ISDIR

# Credentials
HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

# Excludes
EXCLUDES = {
    'node_modules', '.next', '.git', '.idea', '__pycache__', 
    'venv', '.env.local', 'dist', 'build', '.DS_Store',
    'uploaded_media', 'artifacts', 'tmp', '.gemini'
}

def mkdir_p(sftp, remote_directory):
    """Change to this directory, recursively making new folders if needed."""
    if remote_directory == '/':
        sftp.chdir('/')
        return
    if remote_directory == '':
        return
    try:
        sftp.chdir(remote_directory)
    except IOError:
        dirname, basename = os.path.split(remote_directory.rstrip('/'))
        mkdir_p(sftp, dirname)
        try:
            sftp.mkdir(basename)
        except OSError:
            pass
        sftp.chdir(basename)
        return True

def put_dir_recursive(sftp, local_dir, remote_dir):
    # Ensure remote dir exists
    mkdir_p(sftp, remote_dir)
    # Go back to remote_dir because mkdir_p changes cwd inside
    sftp.chdir(remote_dir)
    
    # We need to know absolute path to return or keep track
    # Better strategy: use full paths in put/mkdir without chdir?
    # paramiko mkdir doesn't support -p.
    # Retry simplicity: just create the target dir if it fails.
    pass

def safe_put(sftp, local, remote):
    try:
        sftp.put(local, remote)
    except IOError:
        # Maybe dir doesn't exist
        remote_dir = os.path.dirname(remote)
        mkdir_p(sftp, remote_dir)
        sftp.put(local, remote)

def upload_recursive(sftp, local_path, remote_path):
    local_path = local_path.rstrip("/\\")
    remote_path = remote_path.rstrip("/")
    
    if os.path.isfile(local_path):
         safe_put(sftp, local_path, remote_path)
         return

    # It's a directory
    try:
        sftp.mkdir(remote_path)
    except IOError:
        pass # Exists
        
    for item in os.listdir(local_path):
        if item in EXCLUDES:
            continue
        
        l_item = os.path.join(local_path, item)
        r_item = f"{remote_path}/{item}"
        
        if os.path.isdir(l_item):
            upload_recursive(sftp, l_item, r_item)
        else:
            print(f"Uploading {item}")
            safe_put(sftp, l_item, r_item)

def deploy_code():
    print(f"Deploying to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    sftp = ssh.open_sftp()
    
    # 1. Base files
    files_to_copy = ['docker-compose.prod.yml', 'Makefile']
    for f in files_to_copy:
        if os.path.exists(f):
            print(f"Uploading {f}")
            sftp.put(f, f"{REMOTE_PATH}/{f}")
    
    # 2. Directories
    dirs_to_copy = ['apps/api', 'apps/web', 'nginx']
    for d in dirs_to_copy:
        if os.path.exists(d):
            print(f"Uploading directory {d}...")
            upload_recursive(sftp, d, f"{REMOTE_PATH}/{d}")

    sftp.close()
    ssh.close()
    print("Code deployment finished.")

if __name__ == "__main__":
    deploy_code()

import paramiko
import os
import time

HOST = "217.199.254.119"
USER = "root"
KEY_PATH = r"c:\Users\grama\OneDrive\Docs\Nedvizhka\.agent\keys\vm_key"
LOCAL_BASE = r"c:\Users\grama\OneDrive\Docs\Nedvizhka"
REMOTE_BASE = "/root/Nedvizhka"

files_to_upload = [
    ("apps/web/app/admin/properties/page.tsx", "apps/web/app/admin/properties/page.tsx"),
    ("apps/web/app/admin/districts/page.tsx", "apps/web/app/admin/districts/page.tsx"),
    ("apps/web/app/admin/complexes/page.tsx", "apps/web/app/admin/complexes/page.tsx"),
    ("apps/web/app/admin/files/page.tsx", "apps/web/app/admin/files/page.tsx"),
    ("apps/web/app/admin/admin.module.css", "apps/web/app/admin/admin.module.css"), # Re-upload CSS just in case
]

def deploy():
    print(f"Connecting to {HOST}...")
    k = paramiko.RSAKey.from_private_key_file(KEY_PATH)
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, pkey=k)
    sftp = ssh.open_sftp()

    print("Uploading files...")
    for local_rel, remote_rel in files_to_upload:
        local_path = os.path.join(LOCAL_BASE, local_rel)
        remote_path = f"{REMOTE_BASE}/{remote_rel}"
        
        # Ensure remote dir exists (though it should)
        # remote_dir = os.path.dirname(remote_path)
        # try: sftp.stat(remote_dir); except: ssh.exec_command(f"mkdir -p {remote_dir}")

        print(f"Uploading {local_rel} -> {remote_rel}")
        sftp.put(local_path, remote_path)
    
    sftp.close()
    
    print("Rebuilding web container (PROD)...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_BASE} && docker-compose -f docker-compose.prod.yml build web && docker-compose -f docker-compose.prod.yml up -d --force-recreate web")
    
    # Stream output
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            print(stdout.channel.recv(1024).decode(), end="")
        if stderr.channel.recv_ready():
            print(stderr.channel.recv(1024).decode(), end="")
    
    print("\nDone!")
    ssh.close()

if __name__ == "__main__":
    deploy()

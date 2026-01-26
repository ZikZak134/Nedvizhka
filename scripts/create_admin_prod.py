import paramiko
import os
import sys

# Configuration
HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD_FILE = '.agent/vps_creds.txt'
LOCAL_SCRIPT = 'apps/api/reset_password.py'
REMOTE_PATH = '~/Nedvizhka'

def get_password():
    try:
        with open(PASSWORD_FILE, 'r') as f:
            for line in f:
                if line.startswith('PASSWORD='):
                    return line.strip().split('=', 1)[1]
    except:
        return None

def create_admin():
    password = get_password()
    if not password:
        print("Password missing")
        sys.exit(1)

    print(f"Connecting to {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, username=USERNAME, password=password)
    
    # 1. Upload reset_password.py to host
    print(f"Uploading {LOCAL_SCRIPT}...")
    sftp = client.open_sftp()
    
    # Ensure remote dir exists (it might be deep)
    # Actually, we can just drop it in ~/Nedvizhka/apps/api/reset_password.py
    # But checking if apps/api exists on host might be needed if volume mapping doesn't map source code.
    # In prod, we usually COPY source code into container, so mapping might not exist on host in that path.
    # docker-compose.prod.yml -> volumes: only uploads are mounted.
    # So we need to copy it to host, then docker cp it into container.
    
    sftp.put(LOCAL_SCRIPT, 'reset_password.py') # Upload to ~
    sftp.close()
    
    # 2. Copy into container and run
    print("Executing inside container...")
    
    # Find container id for 'api' service
    # We use docker-compose ps to find it? Or just docker ps filter.
    # Let's try docker-compose exec first, but we need to verify if we can mount the file or cp it.
    # docker cp is safer.
    
    # Get container ID
    print("Listing all containers for debugging...")
    stdin, stdout, stderr = client.exec_command("docker ps --format '{{.ID}} {{.Names}} {{.Image}}'")
    containers = stdout.read().decode().strip().split('\n')
    
    container_id = None
    for line in containers:
        if not line.strip(): continue
        parts = line.split()
        cid = parts[0]
        name = parts[1]
        image = parts[2] if len(parts) > 2 else ""
        
        print(f"Checking: {cid} | {name} | {image}")
        
        # Match by name similar to docker-compose default
        if "api" in name and "db" not in name:
             container_id = cid
             break
    
    if not container_id:
        print("❌ API container not found in list!")
        sys.exit(1)
        
    print(f"Target Container: {container_id}")
    
    # Copy file into container
    client.exec_command(f"docker cp reset_password.py {container_id}:/app/reset_password.py")
    
    # Run script
    # User: superadmin
    # Pass: SuperSecretAdmin2026!
    cmd = f"docker exec -i {container_id} python /app/reset_password.py superadmin 'SuperSecretAdmin2026!'"
    
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    
    out = stdout.read().decode()
    err = stderr.read().decode()
    
    print("--- Output ---")
    print(out)
    if err:
        print("--- Error ---")
        print(err)
        
    client.close()

if __name__ == "__main__":
    create_admin()

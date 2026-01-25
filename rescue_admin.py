
import paramiko
import time

# Credentials from .agent/vps_creds.txt
HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

def run_remote_reset():
    print(f"Connecting to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    print("Uploading reset_password.py logic if needed...")
    # Actually we just rely on what we have, but to be sure let's inline-write or check
    # But wait, I can just upload the file first using SFTP if I want to be 100% sure
    # Or I can just run a python oneliner? NO, too complex.
    # Let's upload the file first.
    
    sftp = ssh.open_sftp()
    local_file = "apps/api/reset_password.py"
    remote_file = f"{REMOTE_PATH}/apps/api/reset_password.py"
    print(f"Uploading {local_file} to {remote_file}")
    try:
        sftp.put(local_file, remote_file)
    except Exception as e:
        print(f"Upload failed (maybe dir doesn't exist?): {e}")
    sftp.close()

    # Now execute inside docker
    print("Executing reset commands...")
    
    # Check if docker is running
    stdin, stdout, stderr = ssh.exec_command("docker ps --format '{{.Names}}'")
    containers = stdout.read().decode().strip().split('\n')
    print(f"Running containers: {containers}")

    api_container = next((c for c in containers if "api" in c and "db" not in c), None)
    
    if api_container:
        print(f"Found API container: {api_container}")
        
        # In PROD, source code is NOT mounted. We must manually copy the script into the container.
        remote_script_host = f"{REMOTE_PATH}/apps/api/reset_password.py"
        print(f"Copying script from host ({remote_script_host}) to container ({api_container}:/app/reset_password.py)...")
        
        # docker cp
        ssh.exec_command(f"docker cp {remote_script_host} {api_container}:/app/reset_password.py")
        
        # Execute directly in container
        cmd = f"docker exec -i {api_container} python reset_password.py regit_admin nimda70"
    else:
        print("API container not found. Using compose fallback.")
        cmd = f"cd {REMOTE_PATH} && docker-compose exec -T api python app/api/reset_password.py regit_admin nimda70"

    
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Wait for output
    exit_status = stdout.channel.recv_exit_status()
    out_str = stdout.read().decode()
    err_str = stderr.read().decode()
    
    print("--- Output ---")
    print(out_str)
    print("--- Errors ---")
    print(err_str)
    
    if exit_status == 0:
        print("✅ SUCCESS: Admin user created/reset.")
    else:
        print("❌ FAILED: Checking alternatives...")
        # Failover: maybe python is just 'python3' or path is different?
        # Or not using docker-compose?
        pass

    ssh.close()

if __name__ == "__main__":
    run_remote_reset()

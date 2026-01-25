import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def force_rebuild():
    print(f"Force Rebuilding API on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    # Prune old images to force clean build?
    # Or just --force-recreate
    cmd = "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d --build --force-recreate api"
    
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Wait for completion
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            print(stdout.channel.recv(1024).decode(), end="")
        if stderr.channel.recv_ready():
            err = stderr.channel.recv(1024).decode()
            print("ERR>", err, end="")
            
    print(stdout.read().decode())
    print("Final STDERR:", stderr.read().decode())
    
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    force_rebuild()

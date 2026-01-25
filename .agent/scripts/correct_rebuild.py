import paramiko
import time

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def correct_rebuild():
    print(f"Correct Rebuild API on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    # 1. Build --no-cache
    print("1. Build --no-cache...")
    cmd1 = "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml build --no-cache api"
    stdin, stdout, stderr = ssh.exec_command(cmd1)
    
    # Stream output
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            print(stdout.channel.recv(1024).decode(), end="")
            
    print(stdout.read().decode())
    print("STDERR1:", stderr.read().decode())
    
    # 2. Up -d
    print("2. Up -d --no-deps...")
    cmd2 = "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d --no-deps api"
    stdin, stdout, stderr = ssh.exec_command(cmd2)
    print(stdout.read().decode())
    print("STDERR2:", stderr.read().decode())
    
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    correct_rebuild()

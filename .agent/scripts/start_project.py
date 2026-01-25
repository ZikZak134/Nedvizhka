import paramiko
import time

# Credentials
HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    
    # Live output streaming
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            print(stdout.channel.recv(1024).decode(), end="")
        if stderr.channel.recv_ready():
            print(stderr.channel.recv(1024).decode(), end="")
        time.sleep(0.1)
        
    exit_status = stdout.channel.recv_exit_status()
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(f"STDERR: {err}")
    
    return exit_status

def start():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    print(f"Connecting to {HOST}...")
    try:
        ssh.connect(HOST, username=USER, password=PASS)
        print("Connected!")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    commands = [
        "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml down",
        "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d --build"
    ]
    
    for cmd in commands:
        run_remote_command(ssh, cmd)

    ssh.close()

if __name__ == "__main__":
    start()

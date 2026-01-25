import paramiko
import time

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def hard_reset():
    print(f"HARD RESET on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    # 1. Down with volumes (wipe DB)
    print("Wiping database and containers...")
    ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml down -v")
    time.sleep(5)
    
    # 2. Rebuild Web (fresh env vars) and Up
    print("Rebuilding and starting...")
    # Using nohup to avoid timeout, or just relying on fast execution if image is cached?
    # Web build takes time. I'll stream output.
    channel = ssh.invoke_shell()
    channel.send("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d --build\n")
    
    time.sleep(2)
    while not channel.exit_status_ready():
        if channel.recv_ready():
            print(channel.recv(1024).decode(), end="")
        time.sleep(1)
        # Break after some time or specific signal? 
        # Shell invoke doesn't close automatically.
        # Better: use exec_command and wait.
    
    ssh.close()

def smart_reset():
    # Because paramiko shell interaction is flaky for long builds, 
    # I'll use simple exec_command but with a long timeout expectation locally.
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    print("1. Down -v (Wipe DB)")
    stdin, stdout, stderr = ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml down -v")
    print(stdout.read().decode())
    
    print("2. Up --build")
    # This might take 1-2 mins for Web build.
    stdin, stdout, stderr = ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d --build")
    
    # Live output loop
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
             print(stdout.channel.recv(1024).decode(), end="")
        time.sleep(1)
        
    print(stdout.read().decode())
    print(stderr.read().decode())
    ssh.close()

if __name__ == "__main__":
    smart_reset()

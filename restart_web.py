
import paramiko
import time

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"
REMOTE_PATH = "/opt/estate-analytics"

def restart_web():
    print(f"Connecting to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    print("Force removing old container via compose...")
    ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml rm -s -f -v web")
    
    print("Building without cache...")
    cmd_build = f"cd {REMOTE_PATH} && docker-compose -f docker-compose.prod.yml up -d --build --no-deps --force-recreate web"
    print(f"Executing: {cmd_build}")
    
    # We use streaming to see progress
    stdin, stdout, stderr = ssh.exec_command(cmd_build)
    while True:
        line = stdout.readline()
        if not line: break
        print(line.strip())
    
    err = stderr.read().decode()
    print("ERR:", err)
    
    print("Finished.")
    ssh.close()

if __name__ == "__main__":
    restart_web()

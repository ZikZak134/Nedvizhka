import paramiko
import os
import time

# Credentials
HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if exit_status != 0:
        print(f"Error: {err}")
    else:
        print(f"Output: {out}")
    return exit_status

def deploy():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    print(f"Connecting to {HOST}...")
    try:
        ssh.connect(HOST, username=USER, password=PASS)
        print("Connected!")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # 1. Update & Install Docker
    commands = [
        "apt-get update && apt-get install -y docker.io docker-compose",
        "systemctl start docker",
        "systemctl enable docker",
        "mkdir -p /opt/estate-analytics",
        # Create uploads directory if not exists
        "mkdir -p /opt/estate-analytics/uploads"
    ]
    
    for cmd in commands:
        run_remote_command(ssh, cmd)

    ssh.close()

if __name__ == "__main__":
    deploy()

import paramiko
import sys
import time

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def start_web():
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        container_name = "bed00ed2853c_nedvizhka_web_1"
        
        commands = [
            f"docker start {container_name}",
            "sleep 5",
            "docker ps | grep web",
            f"docker logs --tail=20 {container_name}"
        ]
        
        full_command = " && ".join(commands)
        
        stdin, stdout, stderr = client.exec_command(full_command)
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err:
            print(f"STDERR: {err}")
            
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    start_web()

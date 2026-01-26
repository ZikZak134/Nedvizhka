import paramiko
import sys
import os

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD_FILE = '.agent/vps_creds.txt'

def get_password():
    try:
        with open(PASSWORD_FILE, 'r') as f:
            for line in f:
                if line.startswith('PASSWORD='):
                    return line.strip().split('=', 1)[1]
    except Exception:
        return None

def diagnose():
    password = get_password()
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, username=USERNAME, password=password)
    
    print("\n--- Memory Usage ---")
    stdin, stdout, stderr = client.exec_command("free -h")
    print(stdout.read().decode())
    
    print("--- Docker PS ---")
    stdin, stdout, stderr = client.exec_command("docker ps -a")
    print(stdout.read().decode())
    
    print("\n--- Web Logs (Tail 20) ---")
    # Try different potential container names
    stdin, stdout, stderr = client.exec_command("docker ps -qf name=web | xargs -r docker logs --tail 20")
    print(stdout.read().decode())
    print(stderr.read().decode())

    print("\n--- Nginx Logs (Tail 20) ---")
    stdin, stdout, stderr = client.exec_command("docker ps -qf name=nginx | xargs -r docker logs --tail 20")
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    client.close()

if __name__ == "__main__":
    diagnose()

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

def debug_deploy():
    password = get_password()
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, username=USERNAME, password=password)
    
    print("--- 1. Check Config ---")
    stdin, stdout, stderr = client.exec_command("cd ~/Nedvizhka && docker-compose -f docker-compose.prod.yml config")
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(out)
    if err: print(f"STDERR: {err}")

    if "services" in out:
        print("\n--- 2. Try UP (Verbose) ---")
        # Try to bring up without build first to see if images exist
        stdin, stdout, stderr = client.exec_command("cd ~/Nedvizhka && docker-compose -f docker-compose.prod.yml up -d")
        print(stdout.read().decode())
        print(stderr.read().decode())
    
    client.close()

if __name__ == "__main__":
    debug_deploy()

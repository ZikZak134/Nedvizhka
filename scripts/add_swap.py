import paramiko
import sys

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD_FILE = '.agent/vps_creds.txt'

def get_password():
    try:
        with open(PASSWORD_FILE, 'r') as f:
            for line in f:
                if line.startswith('PASSWORD='):
                    return line.strip().split('=', 1)[1]
    except:
        return None

def add_swap():
    password = get_password()
    print(f"Connecting to {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, username=USERNAME, password=password)
    
    cmds = [
        "free -h",
        "fallocate -l 2G /swapfile",
        "chmod 600 /swapfile",
        "mkswap /swapfile",
        "swapon /swapfile",
        "echo '/swapfile none swap sw 0 0' >> /etc/fstab",
        "sysctl vm.swappiness=10",
        "echo 'vm.swappiness=10' >> /etc/sysctl.conf",
        "free -h"
    ]
    
    print("Setting up swap...")
    for cmd in cmds:
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out: print(out)
        if err: print(f"Error/Info: {err}")
        
    client.close()

if __name__ == "__main__":
    add_swap()

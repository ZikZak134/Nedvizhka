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

def diagnose():
    print(f"Diagnosing {HOSTNAME}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, username=USERNAME, password=get_password())
    
    cmds = [
        "echo '--- MEMORY ---'",
        "free -h",
        "echo '--- PORTS ---'",
        "netstat -tulpn | grep :80",

        "netstat -tulpn | grep :443",
        "echo '--- DOCKER CONTAINERS ---'",
        "docker ps -a",
        "echo '--- PROCESSES ---'",
        "ps aux | grep nginx",
        "ps aux | grep apache",
        "ps aux | grep httpd"
    ]
    
    for cmd in cmds:
        print(f"\nRunning: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        
    client.close()

if __name__ == "__main__":
    diagnose()

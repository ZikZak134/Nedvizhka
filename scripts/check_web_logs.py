import paramiko
import sys

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def check_web_logs():
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        commands = [
            "docker ps -a | grep web",
            "echo '--- Web Logs ---'",
            "docker logs --tail=100 nedvizhka_web_1"
        ]
        
        full_command = " && ".join(commands)
        stdin, stdout, stderr = client.exec_command(full_command)
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    check_web_logs()

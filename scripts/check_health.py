import paramiko
import sys

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def check_health():
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        print("✅ Connected.")
        
        print("\n--- Uptime ---")
        stdin, stdout, stderr = client.exec_command("uptime")
        print(stdout.read().decode().strip())

        print("\n--- Docker Containers (All) ---")
        stdin, stdout, stderr = client.exec_command("docker ps -a")
        print(stdout.read().decode())
        
        print("\n--- Logs (Web) ---")
        stdin, stdout, stderr = client.exec_command("docker logs nedvizhka_web_1 --tail 50")
        print(stdout.read().decode())
        
        print("\n--- Logs (API) ---")
        stdin, stdout, stderr = client.exec_command("docker logs nedvizhka_api_1 --tail 50")
        print(stdout.read().decode())
        
        print("\n--- Memory ---")
        stdin, stdout, stderr = client.exec_command("free -h")
        print(stdout.read().decode())

        client.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_health()

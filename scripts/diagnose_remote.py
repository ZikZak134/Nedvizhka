import paramiko
import sys

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def diagnose():
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        print("✅ Connected.")

        cmds = [
            ("Check Directory", "ls -la ~/Nedvizhka"),
            ("Check Docker Compose", "docker-compose version"),
            ("Check YAML Content", "cat ~/Nedvizhka/docker-compose.prod.yml"),
            ("Try Up Dry Run", "cd ~/Nedvizhka && docker-compose -f docker-compose.prod.yml config")
        ]

        for title, cmd in cmds:
            print(f"\n--- {title} ---")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            if out: print(out)
            if err: print(f"STDERR: {err}")

        client.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    diagnose()

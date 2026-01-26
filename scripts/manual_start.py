import paramiko
import sys
import os

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def manual_start():
    print(f"Connecting to {USERNAME}@{HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        # Get Key
        yandex_key = ""
        try:
             if os.path.exists('apps/web/.env'):
                 with open('apps/web/.env', 'r') as f:
                    for line in f:
                        if line.startswith('NEXT_PUBLIC_YANDEX_MAPS_KEY='):
                            yandex_key = line.strip().split('=', 1)[1]
                            break
        except: pass

        env_vars = f"export NEXT_PUBLIC_YANDEX_MAPS_KEY={yandex_key}" if yandex_key else ""
        
        # We run WITHOUT -d to see output, and capture it.
        # But we need to use a timeout or it will hang if it succeeds (it attaches).
        # So we use 'up -d' but capture stdout/stderr strictly.
        # Actually, let's try 'up --build' (foreground) for 30 seconds then kill it? 
        # No, better to run 'up -d' and verify exit code and output.
        
        cmd = f"cd ~/Nedvizhka && {env_vars} docker-compose -f docker-compose.prod.yml up -d --build"
        
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        while True:
            line = stdout.readline()
            if not line: break
            print(f"[OUT] {line.strip()}")
            
        err = stderr.read().decode()
        if err:
            print(f"[ERR] {err}")
            
        print(f"Exit: {stdout.channel.recv_exit_status()}")

        client.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    manual_start()

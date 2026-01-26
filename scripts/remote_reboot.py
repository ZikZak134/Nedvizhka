import paramiko
import time
import sys

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD = 'y#+h5u@XcC@QN9'

def reboot_server():
    print(f"Connecting to {USERNAME}@{HOSTNAME} for REBOOT...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=PASSWORD)
        
        print("✅ Connected. Sending reboot command...")
        # exec_command returns immediately, reboot kills connection
        try:
            client.exec_command("reboot")
        except Exception:
            pass # Expected as connection dies
            
        print("🔄 Reboot signal sent. Waiting 60 seconds...")
        client.close()
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reboot_server()

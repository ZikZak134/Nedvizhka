import paramiko
import os
import sys

HOSTNAME = '217.199.254.119'
USERNAME = 'root'
PASSWORD_FILE = '.agent/vps_creds.txt'
PUB_KEY_FILE = '.agent/keys/vm_key.pub'

def get_password():
    try:
        with open(PASSWORD_FILE, 'r') as f:
            for line in f:
                if line.startswith('PASSWORD='):
                    return line.strip().split('=', 1)[1]
    except:
        return None

def setup_ssh_key():
    password = get_password()
    if not password:
        print("Password not found")
        sys.exit(1)
        
    try:
        with open(PUB_KEY_FILE, 'r') as f:
            pub_key = f.read().strip()
    except FileNotFoundError:
        print(f"Public key not found at {PUB_KEY_FILE}")
        sys.exit(1)

    print(f"Connecting to {HOSTNAME}...")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOSTNAME, username=USERNAME, password=password)
        
        # Check if key already exists
        check_cmd = f"grep -F '{pub_key}' ~/.ssh/authorized_keys"
        stdin, stdout, stderr = client.exec_command(check_cmd)
        
        if stdout.channel.recv_exit_status() == 0:
            print("✅ Key already authorized.")
        else:
            print("🔑 key not found. Adding...")
            # Create .ssh dir if needed
            client.exec_command("mkdir -p ~/.ssh && chmod 700 ~/.ssh")
            
            # Append key
            add_cmd = f"echo '{pub_key}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
            client.exec_command(add_cmd)
            print("✅ Key added successfully.")
            
        client.close()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_ssh_key()

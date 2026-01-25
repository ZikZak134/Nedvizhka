import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def full_restart():
    print(f"Full Restart API on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    print("1. Down (safe, no -v)...")
    cmd1 = "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml down"
    stdin, stdout, stderr = ssh.exec_command(cmd1)
    print(stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR1:", stderr.read().decode('utf-8', errors='ignore'))
    
    print("2. Up -d...")
    cmd2 = "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d"
    stdin, stdout, stderr = ssh.exec_command(cmd2)
    print(stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR2:", stderr.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    full_restart()

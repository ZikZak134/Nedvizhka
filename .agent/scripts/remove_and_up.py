import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def remove_and_up():
    print(f"Remove and Up API on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    # 1. Remove container
    print("1. Remove container...")
    ssh.exec_command("docker rm -f estate-analytics_api_1")
    
    # 2. Up -d
    print("2. Up -d...")
    cmd2 = "cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d --no-deps api"
    stdin, stdout, stderr = ssh.exec_command(cmd2)
    print(stdout.read().decode('utf-8', errors='ignore'))
    print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    remove_and_up()

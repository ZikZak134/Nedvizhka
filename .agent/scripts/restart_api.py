import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def restart_api():
    print(f"Restarting API on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    stdin, stdout, stderr = ssh.exec_command("docker-compose -f /opt/estate-analytics/docker-compose.prod.yml restart api")
    print(stdout.read().decode())
    print("Errors:", stderr.read().decode())
    
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    restart_api()

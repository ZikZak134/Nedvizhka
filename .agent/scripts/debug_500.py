import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def get_detailed_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    # Get last 150 lines of API log to see the exception
    stdin, stdout, stderr = ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml logs --tail=150 api")
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    ssh.close()

if __name__ == "__main__":
    get_detailed_logs()

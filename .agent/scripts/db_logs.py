import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def check_db_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    stdin, stdout, stderr = ssh.exec_command("docker logs estate-analytics_db_1 --tail 50")
    print(stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    ssh.close()

if __name__ == "__main__":
    check_db_logs()

import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def check_table():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    cmd = "docker-compose -f /opt/estate-analytics/docker-compose.prod.yml exec -T db psql -U postgres -d estate_analytics -c '\dt'"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    output = stdout.read().decode()
    print("=== TABLES ===")
    print(output)
    print("STDERR:", stderr.read().decode())
    
    ssh.close()

if __name__ == "__main__":
    check_table()

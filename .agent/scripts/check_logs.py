import paramiko
import time

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def check_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(HOST, username=USER, password=PASS)
        # Check API logs to see if it's crashing or just silent (not receiving requests)
        stdin, stdout, stderr = ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml logs --tail=50 api")
        print("=== API LOGS ===")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        # Check Web logs
        stdin, stdout, stderr = ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml logs --tail=50 web")
        print("=== WEB LOGS ===")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_logs()

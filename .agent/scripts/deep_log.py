import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def grab_errors():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    # Get sufficient logs to see the root cause before "transaction is aborted"
    stdin, stdout, stderr = ssh.exec_command("docker logs estate-analytics_api_1 --tail 200")
    print(stdout.read().decode())
    ssh.close()

if __name__ == "__main__":
    grab_errors()

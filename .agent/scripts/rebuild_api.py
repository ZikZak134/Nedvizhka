import paramiko

HOST = "217.199.254.119"
USER = "root"
PASS = "y#+h5u@XcC@QN9"

def rebuild_api():
    print(f"Rebuilding API on {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASS)
    
    # We need to ensure the local files on host are actually used for build.
    # docker-compose build uses the context path.
    # The context is relative to docker-compose.yml.
    # I uploaded files to /opt/estate-analytics/apps/api/...
    # docker-compose.prod.yml has:
    # api:
    #   build:
    #     context: apps/api
    # So yes, it will use the files on the host to build the image!
    
    stdin, stdout, stderr = ssh.exec_command("cd /opt/estate-analytics && docker-compose -f docker-compose.prod.yml up -d --build api")
    
    # Wait for completion (stream output)
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            print(stdout.channel.recv(1024).decode(), end="")
    
    print(stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    ssh.close()
    print("Done.")

if __name__ == "__main__":
    rebuild_api()

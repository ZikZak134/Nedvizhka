
import os
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

def generate_key_pair():
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )

    # Save private key
    priv_path = ".agent/keys/vm_key"
    os.makedirs(os.path.dirname(priv_path), exist_ok=True)
    
    with open(priv_path, "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))

    # Generate public key
    public_key = private_key.public_key()
    pub_path = ".agent/keys/vm_key.pub"
    
    with open(pub_path, "wb") as f:
        f.write(public_key.public_bytes(
            encoding=serialization.Encoding.OpenSSH,
            format=serialization.PublicFormat.OpenSSH
        ))
    
    print(f"Keys generated: {priv_path}, {pub_path}")

if __name__ == "__main__":
    generate_key_pair()

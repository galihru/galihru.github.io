import hashlib
import os

def generate_csp():
    hashes = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                with open(os.path.join(root, file), 'rb') as f:
                    content = f.read()
                    hash_object = hashlib.sha256(content)
                    hashes.append(f"'sha256-{hash_object.digest().hex()}'")
    
    return f"default-src 'self'; script-src {' '.join(set(hashes))} 'unsafe-inline'"

if __name__ == "__main__":
    print(f"Generated CSP: {generate_csp()}")

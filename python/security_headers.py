from bs4 import BeautifulSoup
import os

def add_security_headers(html_file):
    with open(html_file, 'r+') as f:
        soup = BeautifulSoup(f, 'html.parser')
        meta = soup.new_tag('meta')
        meta['http-equiv'] = "Content-Security-Policy"
        meta['content'] = "default-src 'self'; script-src 'self' 'unsafe-inline'"
        soup.head.insert(0, meta)
        
        # Tambah HTTP security headers
        headers = [
            {'http-equiv': 'X-Content-Type-Options', 'content': 'nosniff'},
            {'http-equiv': 'X-Frame-Options', 'content': 'DENY'},
            {'http-equiv': 'Strict-Transport-Security', 'content': 'max-age=63072000'}
        ]
        
        for header in headers:
            tag = soup.new_tag('meta')
            tag.attrs = header
            soup.head.insert(1, tag)
        
        f.seek(0)
        f.write(str(soup))
        f.truncate()

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.html'):
            add_security_headers(os.path.join(root, file))

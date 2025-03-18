from bs4 import BeautifulSoup
import os

def add_security_headers(html_file):
    print(f"Memproses file: {html_file}")  # Debugging
    with open(html_file, 'r+', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
        print(f"Struktur HTML sebelum modifikasi:\n{soup.prettify()}")  # Debugging

        # Pastikan tag <head> ada
        if not soup.head:
            print("Tag <head> tidak ditemukan, membuat tag <head> baru...")  # Debugging
            head_tag = soup.new_tag('head')
            soup.html.insert(0, head_tag)

        # Tambahkan meta tag untuk Content Security Policy
        meta = soup.new_tag('meta')
        meta['http-equiv'] = "Content-Security-Policy"
        meta['content'] = "default-src 'self'; script-src 'self' 'unsafe-inline'"
        soup.head.insert(0, meta)

        # Tambahkan HTTP security headers
        headers = [
            {'http-equiv': 'X-Content-Type-Options', 'content': 'nosniff'},
            {'http-equiv': 'X-Frame-Options', 'content': 'DENY'},
            {'http-equiv': 'Strict-Transport-Security', 'content': 'max-age=63072000'}
        ]

        for header in headers:
            tag = soup.new_tag('meta')
            tag.attrs = header
            soup.head.insert(1, tag)

        # Tulis kembali file HTML
        f.seek(0)
        f.write(str(soup))
        f.truncate()
        print(f"Struktur HTML setelah modifikasi:\n{soup.prettify()}")  # Debugging

# Jalankan fungsi untuk semua file HTML
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.html'):
            add_security_headers(os.path.join(root, file))

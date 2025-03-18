require 'digest'

# Generate SHA-256 hash dari file
def calculate_sha256(filename)
  Digest::SHA256.file(filename).hexdigest
end

# Deteksi potensi serangan SQL Injection
def detect_sql_injection(log_file)
  File.readlines(log_file).each_with_index do |line, index|
    if line.downcase.match(/select|insert|update|delete|union|drop|alter/i)
      puts "Potensi SQL Injection ditemukan di baris #{index + 1}: #{line.strip}"
    end
  end
end

# Main
if ARGV.length != 1
  puts "Usage: ruby log_analyzer.rb <log_file>"
  exit
end

log_file = ARGV[0]
detect_sql_injection(log_file)

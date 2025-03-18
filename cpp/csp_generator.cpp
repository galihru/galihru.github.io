#include <iostream>
#include <fstream>
#include <sstream>
#include <openssl/sha.h>
#include <iomanip>

std::string calculate_sha256(const std::string &filename) {
    std::ifstream file(filename, std::ios::binary);
    if (!file) {
        std::cerr << "File tidak ditemukan!" << std::endl;
        exit(EXIT_FAILURE);
    }

    SHA256_CTX sha256;
    SHA256_Init(&sha256);

    char buffer[1024];
    while (file.read(buffer, sizeof(buffer))) {
        SHA256_Update(&sha256, buffer, file.gcount());
    }
    SHA256_Update(&sha256, buffer, file.gcount());

    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_Final(hash, &sha256);

    std::stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }

    return ss.str();
}

int main() {
    std::string hash = calculate_sha256("../index.html");
    std::cout << "SHA-256 Hash: " << hash << std::endl;

    // Generate CSP
    std::string csp = "default-src 'self'; script-src 'self' 'sha256-" + hash + "'";
    std::cout << "Generated CSP: " << csp << std::endl;

    return 0;
}

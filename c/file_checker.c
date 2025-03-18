#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/sha.h>

void calculate_sha256(const char *filename, unsigned char *output) {
    FILE *file = fopen(filename, "rb");
    if (!file) {
        perror("File tidak ditemukan");
        exit(EXIT_FAILURE);
    }

    SHA256_CTX sha256;
    SHA256_Init(&sha256);

    unsigned char buffer[1024];
    int bytesRead;
    while ((bytesRead = fread(buffer, 1, 1024, file))) {
        SHA256_Update(&sha256, buffer, bytesRead);
    }

    SHA256_Final(output, &sha256);
    fclose(file);
}

int main() {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    calculate_sha256("index.html", hash);

    printf("SHA-256 Hash: ");
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        printf("%02x", hash[i]);
    }
    printf("\n");

    return 0;
}

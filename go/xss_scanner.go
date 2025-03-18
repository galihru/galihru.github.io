package main

import (
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

// SecurityReport struktur untuk menyimpan hasil pemeriksaan keamanan
type SecurityReport struct {
	Timestamp       time.Time
	XSSVulns        []string
	SQLInjections   []string
	CSRFIssues      []string
	HeaderIssues    []string
	ContentSecurity map[string]bool
	FileHash        string
}

// Fungsi untuk menghitung hash SRI (SHA-384) dari file eksternal
func calculateExternalSRIHash(url string) (string, error) {
	// Unduh file eksternal
	resp, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("gagal mengunduh file: %v", err)
	}
	defer resp.Body.Close()

	// Baca konten file
	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("gagal membaca konten file: %v", err)
	}

	// Hitung hash SHA-384
	hash := sha512.Sum384(content)
	return "sha384-" + base64.StdEncoding.EncodeToString(hash[:]), nil
}

// Fungsi untuk menghitung hash file untuk deteksi perubahan
func calculateFileHash(filePath string) (string, error) {
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", err
	}

	hashBytes := sha256.Sum256(content)
	return hex.EncodeToString(hashBytes[:]), nil
}

// Fungsi yang benar untuk menambahkan SRI ke script tags
func addSRIToScripts(content string) string {
    // Pattern untuk script dengan src attribute
    scriptPattern := regexp.MustCompile(`<script([^>]*)src=["']([^"']+)["']([^>]*)>`)
    
    return scriptPattern.ReplaceAllStringFunc(content, func(match string) string {
        if strings.Contains(match, "integrity=") {
            return match
        }
        
        // Ambil URL src
        srcMatch := regexp.MustCompile(`src=["']([^"']+)["']`).FindStringSubmatch(match)
        if len(srcMatch) < 2 {
            return match
        }
        src := srcMatch[1]

	hrefMatch := regexp.MustCompile(`href=["']([^"']+)["']`).FindStringSubmatch(match)
        if len(hrefMatch) < 2 {
            return match
        }
        href := hrefMatch[1]
        
        // Hanya tambahkan SRI untuk URL eksternal
        if strings.HasPrefix(src, "http://") || strings.HasPrefix(src, "https://") || strings.HasPrefix(src, "/") || strings.HasPrefix(href, "/") {
            hash, err := calculateExternalSRIHash(src)
            if err != nil {
                log.Printf("Gagal menghitung hash SRI untuk %s: %v\n", src, err)
                return match
            }
            
            // Tambahkan integrity dan crossorigin
            if strings.HasSuffix(match, "/>") {
                return strings.Replace(match, "/>", fmt.Sprintf(` integrity="%s" crossorigin="anonymous"/>`, hash), 1)
            } else {
                return strings.Replace(match, ">", fmt.Sprintf(` integrity="%s" crossorigin="anonymous">`, hash), 1)
            }
        }
        
        return match
    })
}

// Fungsi untuk memeriksa kerentanan XSS
func detectXSSVulnerabilities(content string) []string {
	patterns := []string{
		`<script\b[^>]*>.*?</script>`,        // Script tags
		`on\w+\s*=\s*['"].*?['"]`,            // Event handlers
		`javascript:\s*[\w\.]+\(.*?\)`,       // JavaScript protocol
		`data:\s*text\/html.*?base64`,        // Data URLs with HTML
		`<iframe\b[^>]*>.*?</iframe>`,        // Iframes
		`<img[^>]+src\s*=\s*['"]?\s*javascript:`, // JavaScript in img src
	}

	var vulnerabilities []string

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindAllString(content, -1)
		vulnerabilities = append(vulnerabilities, matches...)
	}

	return vulnerabilities
}

// Fungsi untuk menghasilkan nonce
func generateNonce() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, 16)
	for i := range result {
		result[i] = chars[rand.Intn(len(chars))]
	}
	return string(result)
}

// Fungsi untuk memeriksa kerentanan SQL Injection
func detectSQLInjectionVulnerabilities(content string) []string {
	patterns := []string{
		`(\w+)\s*=\s*['"].*?(\s*|\+)\d*\s*OR\s*['"].*?['"].*?['"]`,  // OR attacks
		`(\w+)\s*=\s*['"].*?['"];.*?--`,                              // Comment attacks
		`(\w+)\s*=\s*['"].*?UNION\s+SELECT`,                          // UNION attacks
		`(\w+)\s*=\s*['"].*?DROP\s+TABLE`,                            // DROP TABLE attacks
		`(\w+)\s*=\s*['"].*?INSERT\s+INTO`,                           // INSERT attacks
		`(\w+)\s*=\s*['"].*?1\s*=\s*1`,                               // True condition
	}

	var vulnerabilities []string

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindAllString(content, -1)
		vulnerabilities = append(vulnerabilities, matches...)
	}

	return vulnerabilities
}

// Fungsi untuk menambahkan header yang hilang
func addMissingHeaders(content string, nonce string) string {
	headers := []string{
		`<meta http-equiv="X-XSS-Protection" content="1; mode=block">`,
		`<meta http-equiv="X-Content-Type-Options" content="nosniff">`,
		`<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">`,
	}

	for _, header := range headers {
		if !strings.Contains(content, header) {
			content = strings.Replace(content, "</head>", header+"\n</head>", 1)
		}
	}

	return content
}

// Fungsi untuk menambahkan nonce ke elemen-elemen HTML
func addNonceToElements(content string) (string, string) {
    nonce := generateNonce()

    // Tambahkan nonce ke script tags
    scriptPattern := regexp.MustCompile(`<script([^>]*)>`)
    content = scriptPattern.ReplaceAllStringFunc(content, func(match string) string {
        if strings.Contains(match, "nonce=") {
            return match
        }
        return strings.Replace(match, ">", fmt.Sprintf(` nonce="%s">`, nonce), 1)
    })

    // Tambahkan nonce ke style tags
    stylePattern := regexp.MustCompile(`<style([^>]*)>`)
    content = stylePattern.ReplaceAllStringFunc(content, func(match string) string {
        if strings.Contains(match, "nonce=") {
            return match
        }
        return strings.Replace(match, ">", fmt.Sprintf(` nonce="%s">`, nonce), 1)
    })

    // Tambahkan nonce ke link stylesheet
    linkPattern := regexp.MustCompile(`<link([^>]*rel=["']stylesheet["'][^>]*)(/?)>`)
    content = linkPattern.ReplaceAllStringFunc(content, func(match string) string {
        if strings.Contains(match, "nonce=") {
            return match
        }
        
        if strings.HasSuffix(match, "/>") {
            return strings.Replace(match, "/>", fmt.Sprintf(` nonce="%s"/>`, nonce), 1)
        } else {
            return strings.Replace(match, ">", fmt.Sprintf(` nonce="%s">`, nonce), 1)
        }
    })

    return content
}

// Fungsi untuk memeriksa kerentanan CSRF
func detectCSRFVulnerabilities(content string) []string {
	patterns := []string{
		`<form[^>]*>.*?</form>`, // Forms without CSRF tokens
	}

	var vulnerabilities []string

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindAllString(content, -1)
		for _, match := range matches {
			if !strings.Contains(strings.ToLower(match), "csrf") && !strings.Contains(strings.ToLower(match), "token") {
				vulnerabilities = append(vulnerabilities, match)
			}
		}
	}

	return vulnerabilities
}

// Fungsi untuk memeriksa keamanan header
func analyzeSecurityHeaders(content string) []string {
	requiredHeaders := map[string]bool{
		"Content-Security-Policy":       false,
		"X-XSS-Protection":              false,
		"X-Content-Type-Options":        false,
		"X-Frame-Options":               false,
		"Strict-Transport-Security":     false,
	}

	var issues []string

	// Cari meta tag untuk header keamanan
	headerPatterns := map[string]string{
		"Content-Security-Policy":       `<meta\s+http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>`,
		"X-XSS-Protection":              `<meta\s+http-equiv\s*=\s*["']X-XSS-Protection["'][^>]*>`,
		"X-Content-Type-Options":        `<meta\s+http-equiv\s*=\s*["']X-Content-Type-Options["'][^>]*>`,
		"X-Frame-Options":               `<meta\s+http-equiv\s*=\s*["']X-Frame-Options["'][^>]*>`,
		"Strict-Transport-Security":    `<meta\s+http-equiv\s*=\s*["']Strict-Transport-Security["'][^>]*>`,
	}

	for header, pattern := range headerPatterns {
		re := regexp.MustCompile(pattern)
		if re.MatchString(content) {
			requiredHeaders[header] = true
		}
	}

	// Cek header yang hilang
	for header, found := range requiredHeaders {
		if !found {
			issues = append(issues, fmt.Sprintf("Missing security header: %s", header))
		}
	}

	return issues
}

// Fungsi untuk memeriksa kebijakan keamanan konten
func analyzeContentSecurity(content string) map[string]bool {
	securityFeatures := map[string]bool{
		"SRI (Subresource Integrity)": false,
		"CORS Restrictions":           false,
		"HTTPS Resources Only":        true,
		"No Inline JavaScript":        false,
		"No Eval Usage":               true,
	}

	// Cek SRI (Subresource Integrity)
	sriPattern := regexp.MustCompile(`<(?:script|link)[^>]*integrity\s*=\s*["'][^"']*["'][^>]*>`)
	if sriPattern.MatchString(content) {
		securityFeatures["SRI (Subresource Integrity)"] = true
	}

	// Cek CORS
	corsPattern := regexp.MustCompile(`<(?:script|link|img)[^>]*crossorigin\s*=\s*["'][^"']*["'][^>]*>`)
	if corsPattern.MatchString(content) {
		securityFeatures["CORS Restrictions"] = true
	}

	// Cek sumber HTTP
	httpPattern := regexp.MustCompile(`<(?:script|link|img|iframe)[^>]*(?:src|href)\s*=\s*["']http://[^"']*["'][^>]*>`)
	if httpPattern.MatchString(content) {
		securityFeatures["HTTPS Resources Only"] = false
	}

	// Cek JavaScript inline
	inlineJSPattern := regexp.MustCompile(`<script\b[^>]*>(.*?)<\/script>`)
	if inlineJSPattern.MatchString(content) {
		securityFeatures["No Inline JavaScript"] = false
	}

	// Cek penggunaan eval
	evalPattern := regexp.MustCompile(`eval\s*\(`)
	if evalPattern.MatchString(content) {
		securityFeatures["No Eval Usage"] = false
	}

	return securityFeatures
}

// Fungsi untuk memperbaiki masalah keamanan yang perlu ditulis ulang
func fixSecurityIssues(filePath string, report SecurityReport) error {
    content, err := ioutil.ReadFile(filePath)
    if err != nil {
        return err
    }

    contentStr := string(content)

    // Tambahkan nonce ke elemen-elemen dan dapatkan CSP header
    contentStr := addNonceToElements(contentStr)

    // Tulis kembali ke file
    return ioutil.WriteFile(filePath, []byte(contentStr), 0644)
}

// Fungsi untuk menampilkan formulasi matematis keamanan
func printSecurityFormulations() {
	formulations := `
FORMULASI MATEMATIS CYBERSECURITY:

1. Model Risiko Shannon (Entropy-based):
   H(X) = -∑P(xi) log₂ P(xi)
   Dimana:
   - H(X) adalah entropi informasi
   - P(xi) adalah probabilitas kejadian xi
   - Sistem dengan entropi tinggi memiliki ketidakpastian tinggi

2. Model Deteksi Anomali:
   z = (x - μ) / σ
   Dimana:
   - z adalah z-score untuk deteksi anomali
   - x adalah nilai yang diamati
   - μ adalah nilai rata-rata historis
   - σ adalah deviasi standar

3. Indeks Keamanan Web (WSI):
   WSI = w₁V₁ + w₂V₂ + ... + wₙVₙ
   Dimana:
   - WSI adalah indeks keamanan web
   - wᵢ adalah bobot kepentingan dari parameter ke-i
   - Vᵢ adalah nilai parameter keamanan ke-i
   - ∑wᵢ = 1

4. Probabilitas Kerentanan (Vulnerability):
   P(V) = 1 - ∏(1 - P(vᵢ))
   Dimana:
   - P(V) adalah probabilitas kerentanan total
   - P(vᵢ) adalah probabilitas kerentanan individu ke-i

5. Fungsi Risiko:
   R = P(threat) × P(vulnerability) × Impact
   Dimana:
   - R adalah nilai risiko total
   - P(threat) adalah probabilitas ancaman
   - P(vulnerability) adalah probabilitas kerentanan
   - Impact adalah dampak jika terjadi serangan

6. Indeks Keamanan Konten (CSI):
   CSI = (h₁ + h₂ + ... + hₙ) / n
   Dimana:
   - CSI adalah indeks keamanan konten
   - hᵢ adalah nilai implementasi header keamanan ke-i (0 atau 1)
   - n adalah jumlah total header keamanan yang direkomendasikan
`
	fmt.Println(formulations)
}

func main() {
	// Cetak informasi
	fmt.Println("=== Web Security Scanner dan Auto Repair ===")

	// Path file
	filePath := "../index.html"
	if len(os.Args) > 1 {
		filePath = os.Args[1]
	}

	// Baca file
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Fatal("Error membaca file: ", err)
	}
	contentStr := string(content)

	// Hitung hash file untuk monitoring perubahan
	fileHash, err := calculateFileHash(filePath)
	if err != nil {
		log.Println("Gagal menghitung hash file:", err)
	}

	// Buat laporan keamanan
	report := SecurityReport{
		Timestamp:       time.Now(),
		XSSVulns:        detectXSSVulnerabilities(contentStr),
		SQLInjections:   detectSQLInjectionVulnerabilities(contentStr),
		CSRFIssues:      detectCSRFVulnerabilities(contentStr),
		HeaderIssues:    analyzeSecurityHeaders(contentStr),
		ContentSecurity: analyzeContentSecurity(contentStr),
		FileHash:        fileHash,
	}

	// Tampilkan hasil pemeriksaan
	fmt.Println("\n=== LAPORAN KEAMANAN ===")
	fmt.Printf("File: %s\n", filePath)
	fmt.Printf("Waktu pemeriksaan: %v\n", report.Timestamp.Format(time.RFC1123))
	fmt.Printf("File Hash: %s\n\n", report.FileHash)

	fmt.Println("1. KERENTANAN XSS:")
	if len(report.XSSVulns) > 0 {
		for i, vuln := range report.XSSVulns {
			fmt.Printf("   [%d] %s\n", i+1, vuln)
		}
	} else {
		fmt.Println("   Tidak ditemukan kerentanan XSS.")
	}

	fmt.Println("\n2. KERENTANAN SQL INJECTION:")
	if len(report.SQLInjections) > 0 {
		for i, vuln := range report.SQLInjections {
			fmt.Printf("   [%d] %s\n", i+1, vuln)
		}
	} else {
		fmt.Println("   Tidak ditemukan kerentanan SQL Injection.")
	}

	fmt.Println("\n3. KERENTANAN CSRF:")
	if len(report.CSRFIssues) > 0 {
		for i, vuln := range report.CSRFIssues {
			if len(vuln) > 100 {
				vuln = vuln[:100] + "..."
			}
			fmt.Printf("   [%d] %s\n", i+1, vuln)
		}
	} else {
		fmt.Println("   Tidak ditemukan kerentanan CSRF.")
	}

	fmt.Println("\n4. MASALAH HEADER KEAMANAN:")
	if len(report.HeaderIssues) > 0 {
		for i, issue := range report.HeaderIssues {
			fmt.Printf("   [%d] %s\n", i+1, issue)
		}
	} else {
		fmt.Println("   Semua header keamanan telah diimplementasikan dengan baik.")
	}

	fmt.Println("\n5. KEAMANAN KONTEN:")
	for feature, implemented := range report.ContentSecurity {
		status := "✓ Diimplementasikan"
		if !implemented {
			status = "✗ Tidak diimplementasikan"
		}
		fmt.Printf("   [%s] %s\n", feature, status)
	}

	// Tanyakan pengguna apakah ingin memperbaiki masalah keamanan
	fmt.Println("\nMemulai proses perbaikan otomatis...")

	// Perbaiki masalah keamanan
	err = fixSecurityIssues(filePath, report)
	if err != nil {
		log.Fatal("Gagal memperbaiki masalah keamanan: ", err)
	}
	fmt.Println("Perbaikan otomatis berhasil dilakukan!")

	// Tampilkan formulasi matematis keamanan
	printSecurityFormulations()
}

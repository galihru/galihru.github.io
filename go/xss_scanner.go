package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"regexp"
)

func main() {
	// Baca file index.html dari direktori root
	content, err := ioutil.ReadFile("../index.html")
	if err != nil {
		log.Fatal(err)
	}

	// Regex untuk mendeteksi potensi XSS
	xssPattern := regexp.MustCompile(`<script>[^<]+</script>`)
	matches := xssPattern.FindAllString(string(content), -1)

	if len(matches) > 0 {
		fmt.Println("Potensi XSS ditemukan!")
		for _, match := range matches {
			fmt.Println(match)
		}
	} else {
		fmt.Println("Tidak ditemukan potensi XSS.")
	}
}

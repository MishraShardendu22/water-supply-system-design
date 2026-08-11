package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
)

func GenerateOTP() (string, error) {
	const otpChars = "0123456789"
	otp := make([]byte, 6)
	for i := range otp {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(otpChars))))
		if err != nil {
			return "", fmt.Errorf("failed to generate secure random number for OTP: %w", err)
		}
		otp[i] = otpChars[num.Int64()]
	}
	return string(otp), nil
}

func HashOTP(otp string) string {
	hash := sha256.Sum256([]byte(otp))
	return hex.EncodeToString(hash[:])
}

func VerifyOTP(otp string, storedHash string) bool {
	computedHash := HashOTP(otp)
	return computedHash == storedHash
}

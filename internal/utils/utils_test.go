package utils

import (
	"testing"
	"time"
)

func TestOTPGenerationAndVerification(t *testing.T) {
	otp, err := GenerateOTP()
	if err != nil {
		t.Fatalf("GenerateOTP failed: %v", err)
	}

	if len(otp) != 6 {
		t.Fatalf("Expected OTP length 6, got %d (%s)", len(otp), otp)
	}

	hash := HashOTP(otp)
	if hash == "" {
		t.Fatalf("HashOTP returned empty string")
	}

	if !VerifyOTP(otp, hash) {
		t.Fatalf("VerifyOTP failed for valid OTP")
	}

	if VerifyOTP("000000", hash) && otp != "000000" {
		t.Fatalf("VerifyOTP returned true for invalid OTP")
	}
}

func TestJWTGenerationAndValidation(t *testing.T) {
	secret := "test-jwt-secret-key-12345"
	adminID := "admin-uuid-123"
	email := "admin@water.gov"
	role := "Admin"

	token, err := GenerateToken(adminID, email, role, secret, 1*time.Hour)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	claims, err := ValidateToken(token, secret)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}

	if claims.AdminID != adminID || claims.Email != email || claims.Role != role {
		t.Fatalf("Token claims mismatched: %+v", claims)
	}

	_, err = ValidateToken(token, "wrong-secret")
	if err == nil {
		t.Fatalf("ValidateToken should have failed with wrong secret")
	}
}

func TestPasswordHashing(t *testing.T) {
	password := "SecretPass123!"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if !CheckPasswordHash(password, hash) {
		t.Fatalf("CheckPasswordHash failed for correct password")
	}

	if CheckPasswordHash("WrongPassword", hash) {
		t.Fatalf("CheckPasswordHash returned true for wrong password")
	}
}

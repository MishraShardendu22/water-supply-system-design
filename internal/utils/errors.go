package utils

import "errors"

var (
	ErrNotFound          = errors.New("resource not found")
	ErrUnauthorized      = errors.New("unauthorized access")
	ErrForbidden         = errors.New("forbidden")
	ErrBadRequest         = errors.New("bad request")
	ErrConflict          = errors.New("resource conflict")
	ErrInvalidState      = errors.New("invalid request state for this action")
	ErrResourceBusy      = errors.New("resource is busy or unavailable")
	ErrOTPExpired        = errors.New("otp has expired")
	ErrOTPInvalid        = errors.New("invalid otp provided")
	ErrInternalServer    = errors.New("internal server error")
)

type AppError struct {
	Code       string
	Message    string
	StatusCode int
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(statusCode int, code string, message string) *AppError {
	return &AppError{
		StatusCode: statusCode,
		Code:       code,
		Message:    message,
	}
}

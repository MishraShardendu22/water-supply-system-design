package utils

import (
	"log"
	"os"
)

type Logger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
}

var defaultLogger = NewLogger()

func NewLogger() *Logger {
	return &Logger{
		infoLogger:  log.New(os.Stdout, "[INFO] ", log.LstdFlags|log.Lshortfile),
		errorLogger: log.New(os.Stderr, "[ERROR] ", log.LstdFlags|log.Lshortfile),
	}
}

func Info(format string, v ...interface{}) {
	defaultLogger.infoLogger.Printf(format, v...)
}

func Error(format string, v ...interface{}) {
	defaultLogger.errorLogger.Printf(format, v...)
}

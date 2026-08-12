package services

import (
	"context"
	"time"

	"water-supply-system/internal/config"
	"water-supply-system/internal/models"
	"water-supply-system/internal/repositories"
	"water-supply-system/internal/utils"
)

type AdminService struct {
	adminRepo *repositories.AdminRepository
	cfg       *config.Config
}

func NewAdminService(adminRepo *repositories.AdminRepository, cfg *config.Config) *AdminService {
	return &AdminService{
		adminRepo: adminRepo,
		cfg:       cfg,
	}
}

func (s *AdminService) BootstrapInitialAdmin(ctx context.Context) error {
	count, err := s.adminRepo.CountAdmins(ctx)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil // Initial admin already exists
	}

	hash, err := utils.HashPassword(s.cfg.AdminPassword)
	if err != nil {
		return err
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return err
	}

	admin := &models.Administration{
		ID:           id,
		Name:         "System Admin",
		Mail:         s.cfg.AdminEmail,
		PasswordHash: hash,
		Role:         "Admin",
		CreatedAt:    time.Now(),
	}

	if err := s.adminRepo.CreateAdmin(ctx, admin); err != nil {
		return err
	}

	utils.Info("Bootstrapped default admin user (%s)", s.cfg.AdminEmail)
	return nil
}

type LoginInput struct {
	Mail     string `json:"mail"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string                 `json:"token"`
	Admin *models.Administration `json:"admin"`
}

func (s *AdminService) Login(ctx context.Context, input LoginInput) (*LoginResponse, error) {
	if input.Mail == "" || input.Password == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Mail and password are required")
	}

	admin, err := s.adminRepo.GetAdminByMail(ctx, input.Mail)
	if err != nil {
		return nil, err
	}
	if admin == nil {
		return nil, utils.NewAppError(401, "INVALID_CREDENTIALS", "Invalid email or password")
	}

	if !utils.CheckPasswordHash(input.Password, admin.PasswordHash) {
		return nil, utils.NewAppError(401, "INVALID_CREDENTIALS", "Invalid email or password")
	}

	token, err := utils.GenerateToken(admin.ID, admin.Mail, admin.Role, s.cfg.JWTSecret, s.cfg.JWTExpiration)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		Admin: admin,
	}, nil
}

type CreateAdminInput struct {
	Name          string  `json:"name"`
	Mail          string  `json:"mail"`
	Password      string  `json:"password"`
	ContactNumber *string `json:"contactNumber"`
	Role          string  `json:"role"`
}

func (s *AdminService) CreateAdmin(ctx context.Context, input CreateAdminInput) (*models.Administration, error) {
	if input.Name == "" || input.Mail == "" || input.Password == "" {
		return nil, utils.NewAppError(400, "INVALID_INPUT", "Name, mail, and password are required")
	}

	existing, err := s.adminRepo.GetAdminByMail(ctx, input.Mail)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, utils.NewAppError(409, "EMAIL_EXISTS", "Admin email already registered")
	}

	hash, err := utils.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	role := "Dispatcher"
	if input.Role != "" {
		role = input.Role
	}

	id, err := utils.NewUUIDv7()
	if err != nil {
		return nil, err
	}

	admin := &models.Administration{
		ID:            id,
		Name:          input.Name,
		Mail:          input.Mail,
		PasswordHash:  hash,
		ContactNumber: input.ContactNumber,
		Role:          role,
		CreatedAt:     time.Now(),
	}

	if err := s.adminRepo.CreateAdmin(ctx, admin); err != nil {
		return nil, err
	}

	return admin, nil
}

func (s *AdminService) GetAdminByID(ctx context.Context, id string) (*models.Administration, error) {
	admin, err := s.adminRepo.GetAdminByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if admin == nil {
		return nil, utils.NewAppError(404, "ADMIN_NOT_FOUND", "Admin not found")
	}
	return admin, nil
}

func (s *AdminService) ListAdmins(ctx context.Context) ([]*models.Administration, error) {
	return s.adminRepo.ListAdmins(ctx)
}

type UpdateAdminInput struct {
	Name          string  `json:"name"`
	ContactNumber *string `json:"contactNumber"`
	Role          string  `json:"role"`
}

func (s *AdminService) UpdateAdmin(ctx context.Context, id string, input UpdateAdminInput) (*models.Administration, error) {
	admin, err := s.GetAdminByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if input.Name != "" {
		admin.Name = input.Name
	}
	if input.ContactNumber != nil {
		admin.ContactNumber = input.ContactNumber
	}
	if input.Role != "" {
		admin.Role = input.Role
	}

	if err := s.adminRepo.UpdateAdmin(ctx, admin); err != nil {
		return nil, err
	}

	return admin, nil
}

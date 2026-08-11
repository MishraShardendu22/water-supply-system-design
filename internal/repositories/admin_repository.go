package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"water-supply-system/internal/database"
	"water-supply-system/internal/models"
)

type AdminRepository struct {
	db *database.DB
}

func NewAdminRepository(db *database.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) CreateAdmin(ctx context.Context, admin *models.Administration) error {
	query := `
		INSERT INTO administrations (id, name, mail, password_hash, contact_number, role, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query, admin.ID, admin.Name, admin.Mail, admin.PasswordHash, admin.ContactNumber, admin.Role, admin.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert admin: %w", err)
	}
	return nil
}

func (r *AdminRepository) GetAdminByMail(ctx context.Context, mail string) (*models.Administration, error) {
	query := `
		SELECT id, name, mail, password_hash, contact_number, role, created_at
		FROM administrations
		WHERE mail = $1
	`
	row := r.db.QueryRowContext(ctx, query, mail)

	var admin models.Administration
	err := row.Scan(&admin.ID, &admin.Name, &admin.Mail, &admin.PasswordHash, &admin.ContactNumber, &admin.Role, &admin.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query admin by mail: %w", err)
	}
	return &admin, nil
}

func (r *AdminRepository) GetAdminByID(ctx context.Context, id string) (*models.Administration, error) {
	query := `
		SELECT id, name, mail, password_hash, contact_number, role, created_at
		FROM administrations
		WHERE id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var admin models.Administration
	err := row.Scan(&admin.ID, &admin.Name, &admin.Mail, &admin.PasswordHash, &admin.ContactNumber, &admin.Role, &admin.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query admin by id: %w", err)
	}
	return &admin, nil
}

func (r *AdminRepository) ListAdmins(ctx context.Context) ([]*models.Administration, error) {
	query := `
		SELECT id, name, mail, password_hash, contact_number, role, created_at
		FROM administrations
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list admins: %w", err)
	}
	defer rows.Close()

	var list []*models.Administration
	for rows.Next() {
		var admin models.Administration
		if err := rows.Scan(&admin.ID, &admin.Name, &admin.Mail, &admin.PasswordHash, &admin.ContactNumber, &admin.Role, &admin.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan admin row: %w", err)
		}
		list = append(list, &admin)
	}
	return list, nil
}

func (r *AdminRepository) UpdateAdmin(ctx context.Context, admin *models.Administration) error {
	query := `
		UPDATE administrations
		SET name = $1, contact_number = $2, role = $3
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query, admin.Name, admin.ContactNumber, admin.Role, admin.ID)
	if err != nil {
		return fmt.Errorf("failed to update admin: %w", err)
	}
	return nil
}

func (r *AdminRepository) CountAdmins(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM administrations`
	var count int
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count admins: %w", err)
	}
	return count, nil
}

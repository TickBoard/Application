package models

// UserUpdateRequest 用於更新用戶 API
type UserUpdateRequest struct {
	Name *string `json:"name"`
}

// RegisterRequest 用於註冊 API
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

// LoginRequest 用於登入 API
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

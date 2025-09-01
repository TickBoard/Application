package models

// TaskCreateRequest 用於建立任務 API
type TaskCreateRequest struct {
	UserId string `json:"userId"`
	Title  string `json:"title"`
	Memo   string `json:"memo"`
}
package controllers

import (
	"context"
	"gin-api/internal"
	"gin-api/models"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// @Summary 註冊新用戶
// @Description 建立新帳號，回傳 JWT token
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   body  body  models.RegisterRequest  true  "註冊資訊"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /auth/register [post]
func Register(c *gin.Context) {
	type Req struct{ Email, Password, Name string }
	var req Req
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "bad request"})
		return
	}

	col := internal.DB.Collection("users")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()

	// 重複檢查
	var exists models.User
	err := col.FindOne(ctx, bson.M{"email": req.Email}).Decode(&exists)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "email exists"})
		return
	}

	hash, _ := internal.HashPassword(req.Password)
	res, err := col.InsertOne(ctx, bson.M{"email": req.Email, "password": hash, "name": req.Name})
	if err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}

	id := res.InsertedID.(primitive.ObjectID).Hex()
	token, _ := internal.SignJWT(id)
	// 同步設定 HttpOnly Cookie，方便前端直接帶 cookie 存取
	setAuthCookie(c, token)
	c.JSON(201, gin.H{"id": id, "email": req.Email, "name": req.Name, "token": token})
}

// @Summary 用戶登入
// @Description 帳號密碼登入，回傳 JWT token
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   body  body  models.LoginRequest  true  "登入資訊"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"message": "bad request"})
		return
	}

	col := internal.DB.Collection("users")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()

	var u models.User
	if err := col.FindOne(ctx, bson.M{"email": req.Email}).Decode(&u); err != nil {
		c.JSON(401, gin.H{"message": "invalid"})
		return
	}
	if !internal.CheckPassword(u.Password, req.Password) {
		c.JSON(401, gin.H{"message": "invalid"})
		return
	}

	token, _ := internal.SignJWT(u.ID.Hex())
	setAuthCookie(c, token)
	c.JSON(200, gin.H{"id": u.ID.Hex(), "email": u.Email, "name": u.Name, "token": token})
}

// Logout 清除 cookie
func Logout(c *gin.Context) {
	clearAuthCookie(c)
	c.Status(204)
}

// Me 解析 JWT（從 Authorization 或 Cookie）回傳 userId
func Me(c *gin.Context) {
	// 直接沿用 middleware 的解析邏輯
	internal.AuthMiddleware()(c)
	if c.IsAborted() {
		return
	}
	if v, ok := c.Get("userId"); ok {
		c.JSON(200, gin.H{"userId": v})
		return
	}
	c.JSON(401, gin.H{"message": "unauthorized"})
}

// Dashboard 聚合 users 與 tasks
func Dashboard(c *gin.Context) {
	userId := c.Query("userId")
	if userId == "" {
		c.JSON(400, gin.H{"message": "missing userId"})
		return
	}
	uid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(400, gin.H{"message": "bad userId"})
		return
	}
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()

	// 取 user
	var user models.User
	if err := internal.DB.Collection("users").FindOne(ctx, bson.M{"_id": uid}).Decode(&user); err != nil {
		c.JSON(404, gin.H{"message": "user not found"})
		return
	}
	user.Password = ""

	// 取 tasks
	cur, err := internal.DB.Collection("tasks").Find(ctx, bson.M{"userId": uid})
	if err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}
	var tasks []models.Task
	if err := cur.All(ctx, &tasks); err != nil {
		c.JSON(500, gin.H{"message": "decode error"})
		return
	}
	// 確保 memo 不為空字串
	for i := range tasks {
		if tasks[i].Memo == "" {
			tasks[i].Memo = ""
		}
	}
	c.JSON(200, gin.H{"user": user, "tasks": tasks})
}

// helpers for cookie
func setAuthCookie(c *gin.Context, token string) {
	// 與 BFF 相同策略
	isProd := os.Getenv("NODE_ENV") == "production"
	oneDay := 24 * time.Hour
	c.SetCookie(
		"token",
		token,
		int(oneDay.Seconds()),
		"/",
		"",
		isProd, // secure in prod
		true,   // httpOnly
	)
}

func clearAuthCookie(c *gin.Context) {
	isProd := os.Getenv("NODE_ENV") == "production"
	c.SetCookie("token", "", -1, "/", "", isProd, true)
}

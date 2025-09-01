package controllers

import (
	"context"
	"gin-api/internal"
	"gin-api/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// @Summary 取得用戶資訊
// @Description 依用戶ID取得用戶資料
// @Tags Users
// @Produce  json
// @Param   id  path  string  true  "用戶ID"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id} [get]
func GetUser(c *gin.Context) {
	id := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(400, gin.H{"message": "bad id"})
		return
	}
	col := internal.DB.Collection("users")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	var u models.User
	if err := col.FindOne(ctx, bson.M{"_id": oid}).Decode(&u); err != nil {
		c.JSON(404, gin.H{"message": "not found"})
		return
	}
	u.Password = ""
	c.JSON(200, u)
}

// @Summary 更新用戶資訊
// @Description 修改用戶名稱
// @Tags Users
// @Accept  json
// @Param   id  path  string  true  "用戶ID"
// @Param   body  body  models.UserUpdateRequest  true  "更新資訊"
// @Success 204 {string} string "No Content"
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users/{id} [patch]
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(400, gin.H{"message": "bad id"})
		return
	}
	type Req struct {
		Name *string `json:"name"`
	}
	var req Req
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"message": "bad request"})
		return
	}
	upd := bson.M{}
	if req.Name != nil {
		upd["name"] = *req.Name
	}
	col := internal.DB.Collection("users")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	if _, err := col.UpdateByID(ctx, oid, bson.M{"$set": upd}); err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}
	c.Status(204)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(400, gin.H{"message": "bad id"})
		return
	}
	col := internal.DB.Collection("users")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	if _, err := col.DeleteOne(ctx, bson.M{"_id": oid}); err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}
	c.Status(204)
}

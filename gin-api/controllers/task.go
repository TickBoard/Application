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

// @Summary 取得任務列表
// @Description 依 userId 取得所有任務
// @Tags Tasks
// @Produce  json
// @Param   userId  query  string  true  "用戶ID"
// @Success 200 {array} models.Task
// @Failure 500 {object} map[string]string
// @Router /tasks [get]
func ListTasks(c *gin.Context) {
	userId := c.Query("userId")
	uid, _ := primitive.ObjectIDFromHex(userId)
	col := internal.DB.Collection("tasks")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	cur, err := col.Find(ctx, bson.M{"userId": uid})
	if err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}
	var tasks []models.Task
	if err := cur.All(ctx, &tasks); err != nil {
		c.JSON(500, gin.H{"message": "decode error"})
		return
	}
	c.JSON(200, tasks)
}

// @Summary 新增任務
// @Description 建立新任務
// @Tags Tasks
// @Accept  json
// @Produce  json
// @Param   body  body  models.TaskCreateRequest  true  "任務資訊"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /tasks [post]
func CreateTask(c *gin.Context) {
	var req models.TaskCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"message": "bad request"})
		return
	}
	uid, _ := primitive.ObjectIDFromHex(req.UserId)
	col := internal.DB.Collection("tasks")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	res, err := col.InsertOne(ctx, bson.M{
		"userId":    uid,
		"title":     req.Title,
		"memo":      req.Memo,
		"status":    "todo",
		"createdAt": time.Now().Unix(),
	})
	if err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}
	c.JSON(201, gin.H{"id": res.InsertedID})
}

// @Summary 取得單一任務
// @Description 依任務ID取得任務
// @Tags Tasks
// @Produce  json
// @Param   id  path  string  true  "任務ID"
// @Success 200 {object} models.Task
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /tasks/{id} [get]
func GetTask(c *gin.Context) {
	id := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(400, gin.H{"message": "bad id"})
		return
	}
	col := internal.DB.Collection("tasks")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	var t models.Task
	if err := col.FindOne(ctx, bson.M{"_id": oid}).Decode(&t); err != nil {
		c.JSON(404, gin.H{"message": "not found"})
		return
	}
	c.JSON(200, t)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(400, gin.H{"message": "bad id"})
		return
	}
	type Req struct {
		Title  *string `json:"title"`
		Status *string `json:"status"`
		Memo   *string `json:"memo"`
	}
	var req Req
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"message": "bad request"})
		return
	}
	upd := bson.M{}
	if req.Title != nil {
		upd["title"] = *req.Title
	}
	if req.Status != nil {
		upd["status"] = *req.Status
	}
	if req.Memo != nil {
		upd["memo"] = *req.Memo
	}
	col := internal.DB.Collection("tasks")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	if _, err := col.UpdateByID(ctx, oid, bson.M{"$set": upd}); err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}
	c.Status(204)
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(400, gin.H{"message": "bad id"})
		return
	}
	col := internal.DB.Collection("tasks")
	ctx, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	if _, err := col.DeleteOne(ctx, bson.M{"_id": oid}); err != nil {
		c.JSON(500, gin.H{"message": "db error"})
		return
	}
	c.Status(204)
}

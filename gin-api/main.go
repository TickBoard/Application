package main

// @title TaskTrek API
// @version 1.0
// @description 這是 TaskTrek 的後端 API 文件，包含帳號、任務等功能。
// @host localhost:8082
// @BasePath /

import (
	"gin-api/controllers"
	"gin-api/internal"
	"log"
	"os"
	"time"

	_ "gin-api/docs"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	_ = godotenv.Load()
	internal.Connect()

	r := gin.Default()
	// CORS 設定：允許帶 Cookie（credentials），方便前端直接打 API
	r.Use(cors.New(cors.Config{
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: true,
		AllowOriginFunc:  func(origin string) bool { return true },
		MaxAge:           12 * time.Hour,
	}))
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })

	// Swagger 文件路由
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	a := r.Group("/auth")
	a.POST("/register", controllers.Register)
	a.POST("/login", controllers.Login)

	t := r.Group("/tasks")
	t.GET("", controllers.ListTasks)
	t.POST("", controllers.CreateTask)
	t.GET("/:id", controllers.GetTask)
	t.PATCH("/:id", controllers.UpdateTask)
	t.DELETE("/:id", controllers.DeleteTask)

	u := r.Group("/users")
	u.GET("/:id", controllers.GetUser)
	u.PATCH("/:id", controllers.UpdateUser)
	u.DELETE("/:id", controllers.DeleteUser)

	// 帶 /api 前綴的路由，供前端使用
	api := r.Group("/api")
	api.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })
	api.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	a2 := api.Group("/auth")
	a2.POST("/register", controllers.Register)
	a2.POST("/login", controllers.Login)
	a2.POST("/logout", controllers.Logout)

	api.GET("/me", controllers.Me)
	api.GET("/dashboard", controllers.Dashboard)

	t2 := api.Group("/tasks")
	t2.GET("", controllers.ListTasks)
	t2.POST("", controllers.CreateTask)
	t2.GET("/:id", controllers.GetTask)
	t2.PATCH("/:id", controllers.UpdateTask)
	t2.DELETE("/:id", controllers.DeleteTask)

	u2 := api.Group("/users")
	u2.GET("/:id", controllers.GetUser)
	u2.PATCH("/:id", controllers.UpdateUser)
	u2.DELETE("/:id", controllers.DeleteUser)

	port := os.Getenv("PORT")
	log.Println("GIN API listening on :" + port)
	r.Run(":" + port)
}

package main

import (
    "github.com/gin-gonic/gin"
    "fmt"
)

func main() {
    gin.SetMode(gin.ReleaseMode) // Set Gin to production mode

    r := gin.Default()

   
    r.GET("/", func(c *gin.Context) {
        c.File("public/index.html")
    })


    r.GET("/:file", func(c *gin.Context) {
        file := c.Param("file")
        filePath := "public/" + file
        c.File(filePath)
})



    if err := r.Run(":81"); err != nil {
        fmt.Println("Error starting server:", err)
    } else {
        fmt.Println("Server is running on :81")
    }
}

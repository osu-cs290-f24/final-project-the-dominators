var path = require("path")
var express = require("express")
var exphbs = require("express-handlebars")
var http = require("http")
var { Server } = require("socket.io")

var app = express()
var server = http.createServer(app)
var io = new Server(server)
var port = process.env.PORT || 3522

var promptToDraw = "Default Prompt"

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main"
}))
app.set("view engine", "handlebars")

app.use(express.static("static"))

app.get("/", function (req, res) {
    res.render("home") //home has a "Depiction" sign, and a waiting for players sign, and a play button.
})

app.get("/write", function (req, res) {
    res.render("writePrompt")
})

app.get("/draw", function (req, res) {
    res.render("drawPrompt", {
        prompt: promptToDraw
    })
})

app.get("*", function (req, res) {
    res.render("404")
})

// app.listen(port, function () {
//     console.log("== Server is listening on port", port)
// })

io.on("connection", (socket) => {
    console.log("Server-side socket ID connected:", socket.id)

    //Listen for playerConnected from client containing locally stored playerID
    socket.on("playerConnected", (data) => {
        console.log("  -- NewPlayer:", data.socketId)
    })
    socket.on("whichPlayer", (data) => {
        console.log("  -- Player socket ID from client:", data.socketId)
    })
    socket.on("endGame", (data) => {
        console.log("  -- Game ended. Player disconnected: ", data.socketId)
    })

    // Listen for text input from the client
    socket.on("sendInput", (data) => {
        console.log("Received input:", data)

        promptToDraw = data

        // Broadcast the data to all connected clients
        io.emit("receiveInput", data)
    })

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("Server-side socket ID disconnected:", socket.id)
        console.log("")
    })
})

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
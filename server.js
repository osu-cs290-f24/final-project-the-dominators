var path = require('path')
var express = require('express')
var exphbs = require('express-handlebars')
var http = require("http")
var { Server } = require("socket.io")

var app = express()
var server = http.createServer(app)
var io = new Server(server)
var port = process.env.PORT || 3000

var promptToDraw = "Default Prompt"

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main"
}))
app.set("view engine", "handlebars")

app.use(express.static('static'))

app.get('/write', function (req, res) {
    res.render("writePrompt")
})

app.get('/draw', function (req, res) {
    res.render("drawPrompt", {
        prompt: promptToDraw
    })
})

app.get('*', function (req, res) {
    res.render("404")
})

// app.listen(port, function () {
//     console.log("== Server is listening on port", port)
// })

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for text input from the client
    socket.on('sendInput', (data) => {
        console.log('Received input:', data);

        promptToDraw = data

        // Broadcast the data to all connected clients
        io.emit('receiveInput', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
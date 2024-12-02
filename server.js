var path = require('path')
var express = require('express')
var exphbs = require('express-handlebars')
var http = require("http")
var { Server } = require("socket.io")

var app = express()
var server = http.createServer(app)
var io = new Server(server)
var port = process.env.PORT || 3002

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main"
}))
app.set("view engine", "handlebars")

app.use(express.static('static'))

app.get('/draw', function (req, res) {
    res.render("drawPrompt")
})

app.listen(port, function () {
    console.log("== Server is listening on port", port)
})
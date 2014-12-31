var express = require("express")
var session = require("express-session")
var csrf = require("csurf")
var browserify = require("browserify-middleware")
var config = require("./config")

var app = express()

app.disable("x-powered-by")

app.use("/js/main.js", browserify("./client/js/index.js"))

app.use(express.static(__dirname + "/public"))

var sessionSettings = {
	secret: "a very long secret. a md5 hash would be ok",
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true
	}
}

if (app.get("env") === "production") {
	app.set("trust proxy", 1)
	sessionSettings.cookie.secure = true
}

app.use(session(sessionSettings))

app.use(require("body-parser").urlencoded({
	extended: false
}))

app.use(csrf({
	value: function(req) {
		return req.body._csrf
	}
}))

// Hanlde CSRF token errors
app.use(function (err, req, res, next) {
	if (err.code !== "EBADCSRFTOKEN") return next(err)

	res.status(403)
	res.send("Session has expired or form tampered with")
})

require("./routes")(app)

app.listen(config.port, function() {
	console.log("Listening on:", config.port)
})
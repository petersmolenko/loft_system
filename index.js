const dotenv = require("dotenv").config();
const express = require("express");
const auth = require("./controllers/auth");
const path = require("path");
const bodyParser = require('body-parser')
const app = express();
const http = require('http').createServer(app);
const chat = require('./chat')(http);
const db = require("./config/db").connect();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, "public")));

app.use(auth.initialize());
app.all(process.env.API_BASE + "*", auth.jwt);

app.use('/', require('./routes'))

app.use((req, res, next) => {
    res.status(404).json({ "error": "Endpoint not found" });
    next();
});

app.use((error, req, res, next) => {
    if (process.env.MODE === "prod") {
        return res.status(500).json({ "error": "Unexpected error: " + error });
    }
});

const server = http.listen(process.env.PORT || 3000, () => {
    console.log(`> Ready On Server http://localhost:${server.address().port}`);
});

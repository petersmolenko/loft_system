const express = require("express");
const path = require("path");
const bodyParser = require('body-parser')
const app = express();

app.get("/", (req, res) => {return res.render("./public")});

const server = http.listen(process.env.PORT || 3000, () => {
    console.log(`> Ready On Server http://localhost:${server.address().port}`);
});

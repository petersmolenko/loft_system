const dotenv = require("dotenv").config();
const readline = require("readline");
const db = require("../config/db");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const { hashPassword } = require("./");
const User = require("../models/user");

const user = {
    username: "",
    password: "",
    surName: "",
    firstName: "",
    middleName: "",
    image: "",
    permission: {
        chat: { C: true, R: true, U: true, D: true },
        news: { C: true, R: true, U: true, D: true },
        settings: { C: true, R: true, U: true, D: true },
    },
};

rl.question("Username: ", (answer) => {
    user.username = answer;
    rl.question("Password: ", (answer) => {
        user.password = answer;
        rl.close();
    });
});
rl.on("close", async () => {
    try {
        if (user.username && user.password) {
            db.connect(async () => {
                const admin = new User(user);
                await admin.save();
                console.log("Admin is created.");
                process.exit(0)
            });
        } else {
            console.log("No username or password.");
        }
    } catch (error) {
        console.log(error);
    }
});

const express = require("express");
const router = express.Router();
const {Auth, Users, News} = require("../controllers");

router.get("/", (req, res) => {return res.render("./public")});

router.get(process.env.API_BASE + "news", News.getAllNews);
router.get(process.env.API_BASE + "profile", Users.getUser);
router.get(process.env.API_BASE + "users", Users.getAllUsers);

router.get("/*", (req, res) => {return res.redirect("/")});

router.post(process.env.API_BASE + "registration", Auth.signup);
router.post(process.env.API_BASE + "login", Auth.login);
router.post(process.env.API_BASE + "refresh-token", Auth.refreshToken);
router.patch(process.env.API_BASE + "profile", Users.updateUser);
router.patch(process.env.API_BASE + "users/:id/permission", Users.setUserPermission);
router.delete(process.env.API_BASE + "users/:id", Users.deleteUser);

router.post(process.env.API_BASE + "news", News.createNews);
router.patch(process.env.API_BASE + "news/:id",  News.updateNews);
router.delete(process.env.API_BASE + "news/:id",  News.deleteNews);

module.exports = router;
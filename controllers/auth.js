const jwt = require("jwt-simple");
const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user");
const Users = require("../controllers/users");
const { body, validationResult } = require("express-validator");
const { setUser } = require("../utils");

const valids = [
    body("username", "Invalid username").notEmpty(),
    body("password", "Invalid password").notEmpty(),
];

class Auth {
    initialize = () => {
        passport.use("jwt", this.getStrategy());
        return passport.initialize();
    };

    authenticate = (callback) =>
        passport.authenticate(
            "jwt",
            { session: false, failWithError: true },
            callback
        );

    jwt = (req, res, next) => {
        if (req.path.includes(process.env.API_BASE + "login")) return next();
        if (req.path.includes(process.env.API_BASE + "registration"))
            return next();
        return this.authenticate((err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                if (info.name === "TokenExpiredError") {
                    return res
                        .status(401)
                        .json({
                            message:
                                "Your token has expired. Please generate a new one",
                        });
                } else {
                    return res.status(401).json({ message: info.message });
                }
            }
            req.userID = user.id;
            return next();
        })(req, res, next);
    };

    genToken = (user, accessToken = false) => {
        let expires =
            Date.now() + (accessToken ? 30 * 60 * 1000 : 60 * 60 * 1000 * 120);
        const prefix = accessToken ? "access" : "refresh";
        const payload = { exp: expires, username: user.username };
        if (accessToken) payload.permission = user.permission;
        let token = jwt.encode(payload, process.env.JWT_SECRET);
        return {
            [`${prefix}Token`]: `Bearer ${token}`,
            [`${prefix}TokenExpiredAt`]: expires,
        };
    };

    refreshToken = async (req, res) => {
        try {
            const user = await User.findById(req.userID).exec();
            const refreshToken = this.genToken(user);
            const accessToken = this.genToken(user, true);
            res.status(200)
                .header("Authorization", accessToken.token)
                .json({ ...refreshToken, ...accessToken });
        } catch (err) {
            res.status(401).json({
                message: "Invalid credentials",
                errors: err,
            });
        }
    };

    signup = [
        valids,
        async (req, res) => {
            try {
                let errors = validationResult(req);
                if (errors.errors.length > 0) throw errors;
                const permission = {
                    chat: { C: true, R: true, U: true, D: true },
                    news: { C: false, R: true, U: false, D: false },
                    settings: { C: false, R: false, U: false, D: false },
                };
                const user = { ...req.body, permission, image: "" };
                const refreshToken = this.genToken(user);
                const accessToken = this.genToken(user, true);
                const Data = new User(user);
                await Data.save();
                res.status(200)
                    .header("Authorization", accessToken.accessToken)
                    .json({
                        ...setUser(Data),
                        ...refreshToken,
                        ...accessToken,
                    });
            } catch (err) {
                res.status(401).json({
                    message: "Invalid credentials",
                    errors: err,
                });
            }
        },
    ];

    login = [
        valids,
        async (req, res) => {
            try {
                let errors = validationResult(req);
                if (errors.errors.length > 0) throw errors;
                let user = await User.findOne({
                    username: req.body.username,
                }).exec();

                if (user === null) throw "User not found";

                let success = await user.comparePassword(req.body.password);
                if (success === false) throw "Password error";

                const refreshToken = this.genToken(user);
                const accessToken = this.genToken(user, true);

                res.status(200)
                    .header("Authorization", accessToken.accessToken)
                    .json({
                        ...setUser(user),
                        ...refreshToken,
                        ...accessToken,
                    });
            } catch (err) {
                console.log(err);
                res.status(401).json({
                    message: "Invalid credentials",
                    errors: err,
                });
            }
        },
    ];

    getStrategy = () => {
        const params = {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            passReqToCallback: true,
        };

        return new Strategy(params, (req, payload, done) => {
            User.findOne({ username: payload.username }, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (user === null) {
                    return done(null, false, {
                        message: "The user in the token was not found",
                    });
                }

                return done(null, { id: user._id, username: user.username });
            });
        });
    };
}

module.exports = new Auth();

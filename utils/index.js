const bcrypt = require("bcryptjs");
const Jimp = require("jimp");
const User = require("../models/user");

module.exports.hashPassword = (password) => {
    return new Promise((res, rej) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) rej(err);
            res(hash);
        });
    });
};

module.exports.setUser = (userFromDb, delPerm = false) => {
    const user = JSON.parse(JSON.stringify(userFromDb));
    user.id = user._id;
    delete user._id;
    delete user.password;
    delete user.__v;
    if(delPerm) delete user.permission;
    return user;
};

module.exports.validUpdateUserForm = (oldPassword, newPassword) => {
    return (oldPassword === "" && newPassword === "") ||
        (oldPassword !== "" && newPassword !== "")
        ? false
        : true;
};

module.exports.setAvatar = async (source) => {
    const image = await Jimp.read(source);
    const { width, height } = image.bitmap;
    const size = width > height ? height : width;
    const start = width > height ? [width / 2 - size / 2, 0] : [0, height / 2 - size / 2];
    return image.crop(...start, size, size ).resize(270, 270).writeAsync(source)
};

module.exports.transformNews = async (rawNews) => {
    return Promise.all(rawNews.map(el => {
        return new Promise(async res=>{
            const news = JSON.parse(JSON.stringify(el));
            news.id = news._id;
            delete news._id;
            delete news.__v;
            const user = await User.findById(news.user).exec();
            news.user = module.exports.setUser(user, true);
            res(news)
        })
    }))
};

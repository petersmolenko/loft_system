const User = require("../models/user");
const {
    setUser,
    validUpdateUserForm,
    hashPassword,
    setAvatar,
} = require("../utils");
const util = require("util");
const formidable = require("formidable");
const fs = require("fs");
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const path = require("path");

class Users {
    getUser = async (req, res) => {
        try {
            let user = await User.findById(req.userID).exec();

            if (user === null) {
                return res
                    .status(404)
                    .json({ message: "This user doesn't exist" });
            }

            res.status(200).json(setUser(user));
        } catch (err) {
            res.status(400).json(err);
        }
    };

    updateUser = async (req, res) => {
        let form = new formidable.IncomingForm();
        let upload = path.join("./public", "upload");
        if (!fs.existsSync(upload)) {
            fs.mkdirSync(upload);
        }
        form.uploadDir = path.join(process.cwd(), upload);
        form.parse(req, async (err, fields, files) => {
            let avaName = "";
            if (err) {
                return next(err);
            }
            let { newPassword: password, oldPassword } = fields;

            const error = validUpdateUserForm(oldPassword, password);
            try {
                if (files.avatar) {
                    const { name, path: photoPath } = files.avatar;

                    if (error) {
                        await unlink(photoPath);
                        throw new Error(error);
                    }
                    let fileName = path.join(form.uploadDir, name);
                    const errUpload = await rename(photoPath, fileName);

                    if (errUpload)
                        throw new Error("При загрузке фото произошла ошибка!");

                    await setAvatar(fileName);
                    avaName = name;
                }

                let user = await User.findById(req.userID).exec();

                if (user === null) throw "User not found";

                if(password){
                    let success = await user.comparePassword(oldPassword);
                    if (success === false) throw "";
                    password = await hashPassword(password);
                } else {
                    password = user.password
                }

                let image = avaName ? path.join("upload/", avaName) : user.image;
                user = await User.findByIdAndUpdate(
                    req.userID,
                    {
                        ...fields,
                        password,
                        image,
                    },
                    { new: true }
                );
                return res.status(200).json(setUser(user));
            } catch (err) {
                console.log(err);
            }
        });
    };

    deleteUser = async (req, res) => {
        try {
            await User.findByIdAndRemove(req.params.id);
            res.status(200).json({ message: "User deleted successfully!" });
        } catch (err) {
            res.status(400).json({ message: `Error delete user: ${err}` });
        }
    };

    getAllUsers = async (req, res) => {
        try {
            const users = await User.find({}).exec();
            res.status(200).json(users.map((el) => setUser(el)));
        } catch (err) {
            res.status(400).json(err);
        }
    };

    setUserPermission = async (req, res) => {
        try {
            await User.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({
                message: "User permission updated successfully!",
            });
        } catch (err) {
            res.status(400).json({
                message: "Missing parameters",
                errors: err,
            });
        }
    };
}
module.exports = new Users();

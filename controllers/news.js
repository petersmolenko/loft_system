const NewsModel = require("../models/news");
const { transformNews } = require("../utils");

class News {
    getAllNews = async (req, res) => {
        try {
            const news = await transformNews(await NewsModel.find({}).exec());
            res.status(200).json(news);
        } catch (err) {
            res.status(400).json(err);
        }
    };

    createNews = async (req, res) => {
        try {
            const newsItem = new NewsModel({...req.body, user: req.userID});
            await newsItem.save();
            const news = await transformNews(await NewsModel.find({}).exec());
            res.status(200).json(news);
        } catch (err) {
            res.status(400).json(err);
        }
    };

    updateNews = async (req, res) => {
        try {
            await NewsModel.findByIdAndUpdate(req.params.id, {...req.body});
            const news = await transformNews(await NewsModel.find({}).exec())
            res.status(200).json(news);
        } catch (err) {
            res.status(400).json(err);
        }
    };

    deleteNews = async (req, res) => {
        try {
            await NewsModel.findByIdAndRemove(req.params.id);
            const news = await transformNews(await NewsModel.find({}).exec())
            res.status(200).json(news);
        } catch (err) {
            res.status(400).json({ message: `Error delete user: ${err}` });
        }
    };
}
module.exports = new News();

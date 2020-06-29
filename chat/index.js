module.exports = (http) => {
    const io = require("socket.io")(http);
    const Message = require("../models/message");
    const users = {};

    io.on("connection", (socket) => {
        socket.on("users:connect", (user) => {
            users[socket.id] = {
                socketId: socket.id,
                userId: user.userId,
                username: user.username,
                activeRoom: null,
            };

            socket.join(users[socket.id].activeRoom);
            socket.emit("users:list", Object.values(users));
            socket.broadcast.emit("users:add", users[socket.id]);
        });

        socket.on("message:add", async (message) => {
            const mess = new Message({ ...message, created_time: Date.now() });
            await mess.save();
            if (socket.id !== message.roomId)
                socket.emit("message:add", message);
            io.sockets.to(message.roomId).emit("message:add", message);
        });

        socket.on("message:history", async (user) => {
            const senderMessages = await Message.find({senderId: user.userId, recipientId: user.recipientId}).exec();
            const recipientMessages = user.userId === user.recipientId ? [] : await Message.find({senderId: user.recipientId, recipientId: user.userId}).exec();
            socket.emit("message:history", [...senderMessages, ...recipientMessages].sort((a, b) => a.created_time > b.created_time?1:a.created_time < b.created_time?-1:0));
        });

        socket.on("disconnect", () => {
            socket.json.broadcast.emit("users:leave", socket.id);
            delete users[socket.id];
        });
    });
};

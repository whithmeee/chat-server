const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const router = require("./route");
const { addUser, findUser, getRoomUsers } = require("./user");
const app = express();

app.use(
    cors({
        origin: "*",
    })
);
app.use(router);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    socket.on("join", ({ name, room }) => {
        socket.join(room);

        const { user } = addUser({
            name,
            room,
        });

        socket.emit("message", {
            data: {
                user: { name: "Admin" },
                message: `Hey ${user.name}`,
            },
        });

        socket.broadcast.to(user.room).emit("message", {
            data: {
                user: { name: "Admin" },
                message: `${user.name} has join`,
            },
        });

        io.to(user.room).emit("room", {
            data: {
                room: user.room,
                users: getRoomUsers(user.room),
            },
        });
    });

    socket.on("sendMessage", ({ message, params }) => {
        const user = findUser(params);

        if (user) {
            io.to(user.room).emit("message", { data: { user, message } });
        }
    });

    socket.on("exit", ({ params }) => {
        const user = removeUser(params);

        if (user) {
            const { room, name } = user;

            io.to(room).emit("message", {
                data: { user: { name: "Admin" }, message: `${name} has left` },
            });

            io.to(room).emit("room", {
                data: { users: getRoomUsers(room) },
            });
        }
    });

    io.on("disconnect", () => {
        console.log("Пользователь отключился");
    });
});

server.listen(5000, () => {
    console.log("Сервер запущен");
});

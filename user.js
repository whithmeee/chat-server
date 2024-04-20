const { trimSting } = require("./utils");

let users = [];

const findUser = (user) => {
    const userName = trimSting(user.name);
    const userRoom = trimSting(user.room);

    return users.find(
        (u) => trimSting(u.name) === userName && trimSting(u.room) === userRoom
    );
};

const addUser = (user) => {
    console.log("user", user);
    const isExist = findUser(user);

    !isExist && users.push(user);

    const currentUser = isExist || user;

    return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => {
    return users.filter((u) => u.room === room);
};

const removeUser = (user) => {
    const found = findUser(user);

    if (found) {
        users = users.filter(
            ({ room, name }) => room === found.room && name !== found.name
        );
    }

    return found;
};

module.exports = {
    addUser,
    findUser,
    getRoomUsers,
    removeUser,
};

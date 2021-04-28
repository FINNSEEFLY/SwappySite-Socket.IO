const User = require('../models/User')
const bcrypt = require('bcryptjs')
const emailValidator = require("email-validator");
const jwt = require('jsonwebtoken')
const config = require('config')


module.exports = (io, socket) => {
   async function registerUser(accountData, callback) {
        try {
            const {email, password, login} = accountData;

            emailCheck(email,callback)
            passwordCheck(password,callback)
            loginCheck(login,callback)

            const isUserAlreadyExist = await User.isUserAlreadyExist(email, login);

            if (!isUserAlreadyExist.result) {
                return callback({
                    success:false,
                    message:isUserAlreadyExist.message
                })
            }

            const hashedPass = await bcrypt.hash(password, 10)
            const getUserResult = await User.createNewUser(login, email, hashedPass)
            const token = jwt.sign(
                {userId: getUserResult.userId},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )

            callback({
                success: true,
                token,
                userId: getUserResult,
                message: "Пользователь успешно создан"
            });


        } catch (e) {
            callback({
                success: false,
                message: "Внутренняя ошибка сервера при регистрации: "
            });
            console.log(e.message);
        }
    }

    async function loginUser (accountData, callback) {
        try {

            const {password, login} = accountData;

            passwordCheck(password,callback)
            loginCheck(login,callback)

            let getUserResult = await User.getUserByLogin(login);
            if (getUserResult.result === null) {
                return callback({
                    success: false,
                    message: "Неверный логин или пароль"
                })
            }

            const isMatch = await bcrypt.compare(password, getUserResult.result.password)
            if (!isMatch) {
                return callback({
                    success: false,
                    message: "Неверный логин или пароль"
                })
            }

            const token = jwt.sign(
                {userId: getUserResult.result.userId},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )

            callback({
                success: true,
                token,
                userId: getUserResult,
            });

        } catch (e) {
            callback({
                success: false,
                message: "Внутренняя ошибка сервера при авторизации"
            });
        }
    }

    async function authUser (token, callback) {
        try {
            if (!token) {
                return callback({
                    ok: false,
                    message: "Нет авторизации"
                });
            }

            const decodedToken = jwt.verify(token, config.get("jwtSecret"));
            callback({
                ok: true,
                userId: decodedToken.userId
            });
        } catch (e) {
            callback({
                ok: false,
                message: "Нет авторизации"
            });
        }
    }

    function emailCheck(email, callback) {
        if (!emailValidator.validate(email)) {
            return callback({
                success: false,
                message: "Некорректный email"
            });
        }
    }
    function passwordCheck(password, callback) {
        if (password.length === 0 || password.length < 6) {
            return callback({
                success: false,
                message: "Пароль должен состоять как минимум из 6 символов"
            });
        }
    }
    function loginCheck(login, callback) {
        if (!/^[a-zA-Z0-9_-]+$/.test(login)) {
            return callback({
                success: false,
                message: "Логин должен может содержать только латинские буквы символ тире и знак подчеркивания"
            })
        }
    }
    socket.on("user:auth", authUser);
    socket.on("user:register", registerUser);
    socket.on("user:login", loginUser);
}
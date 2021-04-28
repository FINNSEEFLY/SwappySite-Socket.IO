const {insertLinkAndRules} = require("../models/Link");
const {getShortLinkId} = require("../models/Link");
const {getRandomString} = require("../utils/randomStringMaker")
const {insertRandomLink} = require("../models/Link")
const bcrypt = require('bcryptjs')
const systemRegExp = /^((\/)?system)/
const allowedUrls = /^[\/a-zA-Z0-9_\-%]{1,200}$/
const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (io, socket) => {
    async function createLink(params, callback) {
        try {
            let {longUrl, shortUrl, password, clickLimit, disabledOnDateTime, token} = params
            if (systemRegExp.test(shortUrl)) {
                return callback({
                    success: false,
                    message: "Недопустимая ссылка /system зарезервирован"
                })
            }
            if (!allowedUrls.test(shortUrl)) {
                return callback({
                    success: false,
                    message: "Короткая ссылка содержит недопустимые символы или длиннее 200 символов"
                })
            }
            if ((await getShortLinkId(shortUrl)).result!=null) {
                return callback({
                    success: false,
                    message: "Данная короткая ссылка уже существует"
                })
            }
            if (password!==undefined && password==='') {
                return callback({
                    success: false,
                    message: "Заполните пароль"
                })
            } else {
                if (password!==undefined) {
                    password = await bcrypt.hash(password, 10)
                }
            }
            if (clickLimit!==undefined && clickLimit<0) {
                return callback({
                    success: false,
                    message: "Ограничение кликов должно быть положительным"
                })
            }
            if (disabledOnDateTime!==undefined && disabledOnDateTime==='') {
                return callback({
                    success: false,
                    message: "Заполните дату и время"
                })
            }
            if (longUrl.length<=1) {
                return callback({
                    success: false,
                    message: "Заполните длинную ссылку"
                })
            }
            const decodedToken = jwt.verify(token, config.get("jwtSecret"));
            await insertLinkAndRules(shortUrl,longUrl,decodedToken.userId,{password: password, clickLimit: clickLimit, disabledOnDateTime: disabledOnDateTime})
            callback({
                success: true,
                message: "Ссылка успешно добавлена"
            })
        } catch (e) {
            console.log(`Error: ${e.message}+\n+${e.stackTrace}`)
            callback({
                success: false,
                message: "Внутренняя ошибка сервера при создании ссылки"
            })
        }
    }

    async function createAnonymousLink(params, callback) {
        try {
            const {link} = params
            let randomLink;
            do {
                randomLink = getRandomString(8);
            } while (((await getShortLinkId(randomLink)).result))
            await insertRandomLink(randomLink, link)
            callback({
                success: true,
                message: randomLink
            })
        } catch (e) {
            callback({
                success: false,
                message: "Внутренняя ошибка сервера при генерации ссылки"
            })
        }
    }

    socket.on("link:createAnonymous", createAnonymousLink)
    socket.on("link:create", createLink)
}

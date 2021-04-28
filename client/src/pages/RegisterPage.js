import React from 'react'
import {AuthContext} from "../context/AuthContext";
import {useContext, useState, useEffect} from 'react'
import {useMessage} from "../hooks/materialToast";
import {useHttp} from "../hooks/httpUtils";
import {SocketIOContext} from "../context/SocketIOContext";

export const RegisterPage = () => {
    const auth = useContext(AuthContext)
    const {socket} = useContext(SocketIOContext);
    const message = useMessage()
    const {loading, error, clearError} = useHttp()
    const [form, setForm] = useState({
        email: '', password: '', login: ''
    })

    document.title = 'Регистрация';

    async function registerButtonClickHandler(event) {
        try {
            socket.emit("user:register",{...form},(callback)=>{
                message(callback.message);
                if (callback.success) auth.login(callback.token, callback.userId)
            })
        } catch (e) {
        }
    }

    useEffect(() => {
        message(error)
        clearError()
    }, [error, message, clearError])


    function changeHandler(event) {
        setForm({...form, [event.target.name]: event.target.value})
    }

    return (
        <article className="content">
            <section className="AuthBox">
                <h1 id="bannerMainMessage" className="bannerMessage">
                    Регистрация
                </h1>
                <form
                    className="inputForm"
                    id="registerForm"
                    name="registerForm"
                >
                    <div className="input-field">
                        <input
                            type="email"
                            id="emailInput"
                            name="email"
                            className="blue-input"
                            value={form.email}
                            onChange={changeHandler}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            Email
                        </label>
                    </div>
                    <div className="input-field">

                        <input
                            type="text"
                            id="loginInput"
                            name="login"
                            className="blue-input"
                            value={form.login}
                            onChange={changeHandler}
                        />
                        <label htmlFor="" className="labelBeforeInputUrl">
                            Логин
                        </label>
                    </div>
                    <div className="input-field">
                        <input
                            type="password"
                            id="passwordInput"
                            name="password"
                            className="blue-input"
                            value={form.password}
                            onChange={changeHandler}
                        />
                        <label htmlFor="passwordInput" className="labelBeforeInputUrl">
                            Пароль
                        </label>
                    </div>
                    <button
                        type="button"
                        className="buttonForm"
                        onClick={registerButtonClickHandler}
                        disabled={loading}
                    >
                        Зарегистрироваться
                    </button>

                </form>
            </section>
            <section id="wannaMore" className="largeBanner">
                <div className="largeBannerContainer">
                    <h2 id="wannaMoreFirst" className="bannerMessage">Полный контроль</h2>
                    <h3 id="wannaMoreSecond" className="bannerMessage">
                        Статистика по каждому клику и система управления каждой ссылкой!
                    </h3>
                </div>
            </section>
        </article>
    )
}
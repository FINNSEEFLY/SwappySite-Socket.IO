import React from 'react'
import 'materialize-css'
import {AuthContext} from "./context/AuthContext";
import {SocketIOContext} from "./context/SocketIOContext";
import {BrowserRouter as Router} from "react-router-dom";
import {Navbar} from "./components/Navbar";
import {useRoutes} from "./routes";
import {Footer} from "./components/Footer";
import {useAuth} from "./hooks/useAuthHook";
import {useSocketIOHook} from "./hooks/useSocketIOHook";
import {Loader} from "./components/Loader";

function App() {
    const {token, login, logout, userId, ready} = useAuth()
    const {socket} = useSocketIOHook()
    const isAuthenticated = Boolean(token);
    const routes = useRoutes(isAuthenticated)

    if (!ready) {
        return <Loader/>
    }

    return (
        <SocketIOContext.Provider value={{socket}}>
            <AuthContext.Provider value={{token, login, logout, userId, isAuthenticated}}>
                <Router>
                    <Navbar/>
                    {routes}
                    <Footer/>
                </Router>
            </AuthContext.Provider>
        </SocketIOContext.Provider>
    )
}

export default App;

import {useState, useEffect} from 'react'
import {io} from "socket.io-client";

export const useSocketIOHook = () => {
    const [socket] = useState(io("http://swappy.site"))

    useEffect(() => {
        if (socket.disconnected) {
            socket.connect();
        }
        return () => {
            socket.emit("break", {message: "disconnected"})
            socket.disconnect()
        };
    }, []);


    return { socket }
}
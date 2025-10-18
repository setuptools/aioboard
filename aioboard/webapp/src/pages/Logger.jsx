
import React from "react";
import { useEffect, useState, useRef } from "react";

import axios from "axios";

import { AnimatePresence,motion } from "motion/react";

import "./Logger.css";

const Logger = ()=>{

    const [botInfo , setBotInfo] = useState({
        "username":"aioboard_bot",
        "first_name":"AiboardBot",
        "id":9999999999,
        "token":"XXXXXXXXXXXXXXXXXX"
    });
    

    const [value , setValue] = useState("");
    const [events, setEvents] = useState([]);

    useEffect(()=>{

        const fetchInfo = async () => {
            try {
                const bot_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotInfo");
                const bot_events = await axios.get("http://127.0.0.1:3011/api/logger/botLogs");
                setBotInfo(bot_data.data);
                setEvents(bot_events.data.map(e => ({ ...e, id: `${Date.now()}-${Math.random()}`})).reverse());

            } catch (err) {
                console.error(err);
                }
            };

        fetchInfo();
    },[])


    useEffect(()=>{
        let ws = new WebSocket("ws://127.0.0.1:3011/api/logger/botLogger");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setEvents(prev => [{ ...data, id: `${Date.now()}-${Math.random()}` }, ...prev]);
        };

        return () => ws.close();
    },[])


    const filteredEvents = value === ""
    ? events
    : events.filter(event => {

        const matchesType = event?.type.toLowerCase().includes(value.toLowerCase());
        const matchesData = event?.data?.toLowerCase().includes(value.toLowerCase());
        const matchesUsername = event?.from?.username
            ? event.from.username.toLowerCase().includes(value.toLowerCase())
            : event.from.first_name.toLowerCase().includes(value.toLowerCase());
        
        return matchesType || matchesData || matchesUsername;
    });


    return (
        <div className="logger">
            
            <div className="logger-filters">
                <input type="text" 
                className="logger-filter-input"
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                placeholder="Input filter"
                />
            </div>

            <div className="log-container">
                <AnimatePresence>
                {filteredEvents.map((event,idx) => (
                    <motion.section
                        className="log-info"
                        key={event.id} 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.1 }}
                    >
                        <span style={{ fontSize: "13px" ,color:"var(--text-color)"}}>From: <span style={{color:"var(--text-color__2)"}}>@{event.from.username} ({event.from.id})</span></span>
                        <span style={{ fontSize: "13px" ,color:"var(--text-color)"}}>Type: <span style={{color:"var(--text-color__2)"}}>{event.type}</span></span>

                        <span style={{ fontSize: "12px" ,color:"var(--text-color)"}}>Message:  <br /><br /><span style={{color:"var(--text-color__2)",left:"20px",top:"10px"}}>
                                {event?.data?.slice(0,130)}    
                            </span>
                        </span>
                    </motion.section>
                    ))}
                </AnimatePresence>
            </div>
        </div>
        )
}


export default Logger;
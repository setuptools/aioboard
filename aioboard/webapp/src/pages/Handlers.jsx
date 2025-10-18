
import React from "react";
import { useEffect, useState, useRef } from "react";

import axios from "axios";
import { AnimatePresence,m,motion } from "motion/react";

import {ReactComponent as DeleteSVG} from "../data/icons/delete.svg?react";
import {ReactComponent as AddSVG} from "../data/icons/add.svg?react";
import {ReactComponent as BanSVG} from "../data/icons/ban.svg?react";
import {ReactComponent as UnBanSVG} from "../data/icons/unban.svg?react";
import {ReactComponent as MarkSVG} from "../data/icons/mark.svg?react";



import "./Handlers.css";

const Handlers = ()=>{

    const [botInfo , setBotInfo] = useState({
        "username":"aioboard_bot",
        "first_name":"AiboardBot",
        "id":9999999999,
        "token":"XXXXXXXXXXXXXXXXXX"
    });
    const [handlers , setHandlers] = useState()
    const [handlersCopy , setHandlersCopy] = useState(handlers);
    const [value , setValue] = useState("");
        

    useEffect(()=>{

        const fetchInfo = async () => {
            try {
                const bot_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotInfo");
                setBotInfo(bot_data.data);

                const handlers_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotHandlers");

                const _handlers = handlers_data.data.data.reverse().map(h=>({
                    name:h.name,
                    id: Math.random(),
                    handlers:h.handlers.map(h => {return {name: h.name , work: h.work , id: Math.random()}})
                }));
                
                setHandlers(_handlers);
                setHandlersCopy(_handlers);

            } catch (err) {
                console.error(err);
                }
            };

        fetchInfo();
    },[])


    const isChanged = JSON.stringify(handlers) !== JSON.stringify(handlersCopy);
    

    const saveChanges = async()=>{
        setHandlers(handlersCopy);

        const response = await axios.post("http://127.0.0.1:3011/api/bot/editBotValue",{
            "field":"handlers",
            "value":handlersCopy,
        })
    }


    const updateHandlerWork = async(handlerId, hId, workStatus) => {
        setHandlersCopy(prevHandlers =>
            prevHandlers.map(handler => handler.id === handlerId ? {
                    ...handler,
                    handlers: handler.handlers.map(h => 
                        h.id === hId ? { ...h, work: workStatus } : h
                    )
                } : handler
            )
        );

        
    };

    const filteredHandlers =  value === ""
        ? handlersCopy
        : handlersCopy.filter(handler => {
        
            return handler;
        });
    
    


    return (
        <div className="handlers-page">
            
            <div className="handler-filters">
                <input type="text" 
                className="handler-filter-input"
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                placeholder="Input filter"
                />
            </div>

            <div className="handler-container">
                <AnimatePresence>
                {handlers?.length == 0 || handlers == undefined ? <motion.section key = {Date() + Math.random()}  className="databse-no-users">
                    [No handlers in bot right now]
                </motion.section > : filteredHandlers?.map((handler,idx) => (
                    <motion.div key ={Date() + idx + Math.random()} className="handlers-info-container" style={{"display":"flex"}}>    
                        <motion.section 
                            className="handler-info"
                            key={handler?.id} 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.1 }}
                        >
                            <span key={Date() + idx + Math.random()}  style={{ fontSize: "13px",color:"var(--text-color)"}}> {handler?.name}({handler?.handlers.length})</span>

                            {/* <button onClick={(e)=>{updateChanges(user.id , "is_banned", !user.is_banned)}} className="database-info-button-ban">
                                {user.is_banned ?
                                    <UnBanSVG style={{height:"100%",width:"100%",fill:"var(--text-color)"}}/>
                                    :
                                    <BanSVG style={{height:"100%",width:"100%",fill:"var(--text-color)"}}/>
                                }
                            </button> */}

                        </motion.section>

                        {handler?.handlers.map((h, i) => {
                        const name = h && typeof h === "object" ? h.name : h ?? "unknown";



                        return (
                            <motion.div className="handler-inner-info" key={h.id ?? i}>
                            <motion.span style={{ fontSize: "12px", color: "var(--text-color)" }}>
                                {name}
                            </motion.span>

                            <motion.label className="handler-switch">
                                <motion.input 
                                type="checkbox" 
                                checked={h?.work} 
                                onChange={(e) => updateHandlerWork(handler.id, h.id, !h?.work)}
                                />
                                <motion.span className="slider"></motion.span>
                            </motion.label>
                            </motion.div>
                        );
                        })}
                    </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isChanged && (
                    <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="save-container"
                    >
                    <span style={{position:"absolute",left:"10px",fontSize:14,color:"var(--text-color)"}}>
                        Save changes?
                    </span>

                    <button onClick={(e)=>saveChanges()} style={{backgroundColor:"var(--save-button-color)",color:"var(--text-color)"}}>
                        Save
                    </button>

                    <button onClick={(e)=>setHandlersCopy(handlers)} style={{backgroundColor:"var(--cancel-button-color)",color:"var(--text-color)"}}>
                        Cancel
                    </button>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
        )
}


export default Handlers;
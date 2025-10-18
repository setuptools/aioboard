
import React from "react";
import { useEffect, useState, useRef } from "react";

import axios from "axios";

import "./Main.css";
import { useAsyncError } from "react-router-dom";
import {motion,AnimatePresence} from "motion/react";

const Main = ()=>{

    const [botInfo , setBotInfo] = useState({
        "username":"aioboard_bot",
        "first_name":"AiboardBot",
        "id":9999999999,
        "token":"XXXXXXXXXXXXXXXXXX",
        "description":"Aioboard test description for checking field"
    });
    const [botInfoCopy , setBotInfoCopy] = useState(botInfo);

    const debounceRef = useRef(null);

    const [hidden, setHidden] = useState(true);
    const hideChar = "░";

    useEffect(()=>{


        const fetchInfo = async () => {
            try {
                const bot_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotInfo");
                setBotInfo(bot_data.data);
                setBotInfoCopy(bot_data.data);


            } catch (err) {
                console.error(err);
                }
            };

        fetchInfo();
    },[])


    const displayedToken = hidden
    ? hideChar.repeat(botInfo.token.length)
    : botInfo.token;


    // change values
    const changeValue = (value, field) => {
        setBotInfoCopy(prev => ({ ...prev, [field]: value }));

        debounceRef.current = setTimeout(async () => {
            try {
                const bot_data = await axios.post("http://127.0.0.1:3011/api/bot/editBotValue", {
                    field: field,
                    value:value
                });
                console.log(bot_data.data);
            } catch (err) {
                console.error(err);
            }
        }, 1000); 
    };

    const saveChanges = async ()=>{
        setBotInfo(botInfoCopy);
    }

    const isChanged = JSON.stringify(botInfo) !== JSON.stringify(botInfoCopy);

    return (
        <AnimatePresence mode="wait">
             <div className="main">
                <div className="main-container" style={{color:"var(--text-color)"}}>
                    <section className="main-section">
                    <img className="bot-image" src="http://127.0.0.1:3011/api/bot/getBotAvatar" alt="Bot image"/>
                    <span style={{fontSize:"15px"}}>{botInfo.first_name}</span>
                    <span style={{fontSize:"20px"}}>@{botInfo.username}</span>
                    </section>

                    <section className="main-section">
                        <span className="main-section-title">
                            Main data
                        </span>

                        <div className="main-section-in">
                            <span>Bot name:</span>
                            <input type="text" 
                            id="bot-username-input"
                            onChange={(e) =>{changeValue(e.target.value , "first_name")}}
                            value = {botInfoCopy.first_name}/>
                        </div>

                        <div className="main-section-in">
                            <span>Token:</span>
                            <input type="text"
                            style={{width:"410px",cursor:"pointer"}} 
                            readOnly
                            id="bot-token-input"
                            onClick={() => {
                                navigator.clipboard.writeText(botInfo.token)
                                .then(() => alert("Token copied to clipboard!"))
                                .catch(err => console.error("Failed to copy token: ", err));
                                setHidden(false);
                            }}
                            value = {displayedToken}/>
                        </div>

                        <div className="main-section-in" style={{flexDirection:"column",alignItems:"flex-start",gap:"10px"}}>
                            <span>Description:</span>
                            <textarea type="text"
                                style={{width:"100%",height:"300px",cursor:"pointer",boxSizing:"border-box",padding:"10px",maxWidth:"490px",resize:"none"}} 
                                id="bot-description-input"
                                onChange={(e) =>{changeValue(e.target.value , "description")}}
                                value = {botInfoCopy.description}/>
                        </div>
                    </section>
                </div>

                <AnimatePresence>
                {isChanged&& botInfoCopy.first_name != "" && (
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

                    <button onClick={(e)=>setBotInfoCopy(botInfo)} style={{backgroundColor:"var(--cancel-button-color)",color:"var(--text-color)"}}>
                        Cancel
                    </button>

                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </AnimatePresence>
    )
}


export default Main;
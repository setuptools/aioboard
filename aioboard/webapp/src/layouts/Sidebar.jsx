import React from "react";
import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css";

import axios from 'axios';
import { useTheme } from "../contexts/ThemeContext";

import { ReactComponent as MoonSvg } from "../data/icons/moon.svg"
import { ReactComponent as SunSvg } from "../data/icons/sun.svg"

const Sidebar = ()=>{
    

    const {toggleTheme,theme} = useTheme();

    const [botInfo , setBotInfo] = useState({
        "username":"aioboard_bot",
        "first_name":"AiboardBot",
        "id":9999999999
    });


    useEffect(()=>{

        const fetchInfo = async () => {
            try {
                const bot_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotInfo");
                setBotInfo(bot_data.data);

            } catch (err) {
                console.error(err);
                }
            };

        fetchInfo();
    },[])


    const openReadme =async ()=>{
        await axios.post("http://127.0.0.1:3011/api/another/openReadME")
    }
    

    return (
        <div className="sidebar-container">
        
            <div className="sidebar">
                <NavLink id="bot_info" to="/">
                    <div className="bot-image">
                        <img src="http://127.0.0.1:3011/api/bot/getBotAvatar" alt="Bot image"/>
                    </div>

                    <div className="bot-information">
                        {botInfo && (
                        <>
                            <span>{`${botInfo.first_name}`}</span>
                            <span style={{ display: "block", fontSize:"12px",color:"var(--text-color__2)"}}>{`@${botInfo.username}`}</span>
                        </>
                        )}

                    </div>
                </NavLink>

                <div className="sidebar-panel">

                    <NavLink className="sidebar-button" id="commands" to="/commands">
                        <img src="../data/icons/command.ico" alt="commands_ico"/>
                        <span>Commands</span>
                    </NavLink>

                    <NavLink className="sidebar-button" id="handler" to="/handlers">
                        <img src="../data/icons/handler.ico" alt="handler_ico"/>
                        <span>Handlers</span>
                    </NavLink>

                    <NavLink className="sidebar-button" id="db" to="/database">
                        <img src="../data/icons/db.ico" alt="handler_ico"/>
                        <span>Database</span>
                    </NavLink>

                    <NavLink className="sidebar-button" id="db" to="/logger">
                        <img src="../data/icons/log.ico" alt="handler_ico"/>
                        <span>Logger</span>
                    </NavLink>


                </div>


                <div className="sidebar-footer">
                    {/* <button className="sidebar-footer-button" onClick={(e)=>{openReadme()}}>
                        <img src="../data/icons/readme.ico" alt="handler_ico"/>
                    </button> */}

                    <a className="sidebar-footer-button" download="README.md" href="http://127.0.0.1:3011/api/another/getReadME" target="_blank">
                        <img src="../data/icons/readme.ico" alt="handler_ico"/>
                    </a>


                    <button className="sidebar-footer-button" onClick={(e)=>{toggleTheme()}}>
                        {theme == "light" ? <MoonSvg style={{height:"80%"}}/> : <SunSvg style={{height:"80%"}}/>}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Sidebar;
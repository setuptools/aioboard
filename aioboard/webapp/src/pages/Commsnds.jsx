
import React from "react";
import { useEffect, useState, useRef } from "react";

import axios from "axios";
import { AnimatePresence,motion } from "motion/react";

import {ReactComponent as DeleteSVG} from "../data/icons/delete.svg?react";
import {ReactComponent as AddSVG} from "../data/icons/add.svg?react";

import "./Commands.css";

const Commands = ()=>{

    const [botInfo , setBotInfo] = useState({
        "username":"aioboard_bot",
        "first_name":"AiboardBot",
        "id":9999999999,
        "token":"XXXXXXXXXXXXXXXXXX"
    });
    const [commands ,setCommands] = useState()
    const [commandsCopy , setCommandsCopy] = useState(commands);
    const [value , setValue] = useState("");
        

    useEffect(()=>{

        const fetchInfo = async () => {
            try {
                const bot_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotInfo");
                setBotInfo(bot_data.data);

                const _commands = bot_data.data.commands.map(e => ({ ...e, id: `${Date.now()}-${Math.random()}`})).reverse();

                setCommands(_commands);
                setCommandsCopy(_commands);

            } catch (err) {
                console.error(err);
                }
            };

        fetchInfo();
    },[])


    const isChanged = JSON.stringify(commands) !== JSON.stringify(commandsCopy);

    const saveChanges = async()=>{
        setCommands(commandsCopy)

        const response = await axios.post("http://127.0.0.1:3011/api/bot/editBotValue",{
            "field":"commands",
            "value":commandsCopy
        })
    }

    const updateChanges = async(id, type,value)=>{
    
        if (["name","description"].includes(type)){
            setCommandsCopy(prev => 
            prev.map(cmd => 
                    cmd.id === id ? { ...cmd, [type]: value } : cmd
                )
            );
        } else if (type == "delete"){
            const newCommands = commandsCopy.filter(cmd => cmd.id !== id);
            setCommandsCopy(newCommands);
        } else if (type == "add"){
            setCommandsCopy(prev => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                name: "newCommand",
                description: "Command description"
            }
            ]);
        }
    }



    const filteredCommands =  value === ""
        ? commandsCopy
        : commandsCopy.filter(event => {
            
            const command = event?.command?.toLowerCase() || "";
            const matchesCommand = command.includes(value.toLowerCase());
        
            const matchesDescription = event?.description?.toLowerCase().includes(value.toLowerCase());
            
            return matchesCommand || matchesDescription;
        });
    



    return (
        <div className="commands">
            
            <div className="commands-filters">
                <input type="text" 
                className="commands-filter-input"
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                placeholder="Input filter"
                />

                <button onClick={(e)=>updateChanges(1 , "add",1)}>
                    <AddSVG style={{height:"100%",width:"100%",fill:"var(--text-color)"}}/>
                </button>
            </div>

            <div className="commands-container">
                <AnimatePresence>
                {filteredCommands?.map((command,idx) => (
                    <motion.section 
                        className="command-info"
                        key={command.id} 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        <span style={{ fontSize: "13px",color:"var(--text-color)"}}>/
                            <input value={command.name} onChange={(e)=>updateChanges(command.id ,"name", e.target.value)}
                                style={{ fontSize: "13px",color:"var(--text-color)",marginLeft:"5px",marginRight:"10px"}}
                                ></input>
                            —
                            <input style={{color:"var(--text-color)",marginLeft:"10px"}} value={command.description} onChange={(e)=>updateChanges(command.id ,"description", e.target.value)}></input>
                        
                        </span>

                        <button onClick={(e)=>updateChanges(command.id , "delete",command.id)}>
                            <DeleteSVG style={{height:"100%",width:"100%"}}/>
                        </button>

                    </motion.section>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
            {isChanged && !commandsCopy.some(cmd => !cmd.name || cmd.name.trim() === "")    && (
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

                <button onClick={(e)=>setCommandsCopy(commands)} style={{backgroundColor:"var(--cancel-button-color)",color:"var(--text-color)"}}>
                    Cancel
                </button>

                </motion.div>
            )}
            </AnimatePresence>
        </div>
        )
}


export default Commands;
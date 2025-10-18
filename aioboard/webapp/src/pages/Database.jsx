
import React from "react";
import { useEffect, useState, useRef } from "react";

import axios from "axios";
import { AnimatePresence,motion } from "motion/react";

import {ReactComponent as DeleteSVG} from "../data/icons/delete.svg?react";
import {ReactComponent as AddSVG} from "../data/icons/add.svg?react";
import {ReactComponent as BanSVG} from "../data/icons/ban.svg?react";
import {ReactComponent as UnBanSVG} from "../data/icons/unban.svg?react";
import {ReactComponent as MarkSVG} from "../data/icons/mark.svg?react";



import "./Database.css";

const Database = ()=>{

    const [botInfo , setBotInfo] = useState({
        "username":"aioboard_bot",
        "first_name":"AiboardBot",
        "id":9999999999,
        "token":"XXXXXXXXXXXXXXXXXX"
    });
    const [users ,setUsers] = useState()
    const [usersCopy , setUsersCopy] = useState(users);
    const [value , setValue] = useState("");
        

    useEffect(()=>{

        const fetchInfo = async () => {
            try {
                const bot_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotInfo");
                setBotInfo(bot_data.data);

                const users_data = await axios.get("http://127.0.0.1:3011/api/bot/getBotUsers");
                

                const _users = users_data.data.reverse();
                
                setUsers(_users);
                setUsersCopy(_users);

            } catch (err) {
                console.error(err);
                }
            };

        fetchInfo();
    },[])


    const isChanged = JSON.stringify(users) !== JSON.stringify(usersCopy);
    

    const saveChanges = async()=>{
        setUsers(usersCopy)

        const response = await axios.post("http://127.0.0.1:3011/api/bot/editBotUsers",{
            "users":users,
        })
    }

    const updateChanges = async(id, type,value)=>{
        setUsersCopy(prev => prev.map(u => u.id == id ? {...u , [type]:value} : u))
    
    }



    const filteredUsers =  value === ""
        ? usersCopy
        : usersCopy.filter(user => {
        
            const needUsername = user?.username ? "@"+user?.username : "";
            const matchesUsernames = needUsername.toLowerCase().includes(value.toLowerCase());
        
            const matchesIds = user?.id.toString().includes(value.toLowerCase());
            
            return matchesUsernames || matchesIds;
        });
    



    return (
        <div className="database">
            
            <div className="database-filters">
                <input type="text" 
                className="database-filter-input"
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                placeholder="Input filter"
                />
            </div>

            <div className="database-container">
                <AnimatePresence>
                {users?.length == 0 || users == undefined ? <motion.section className="databse-no-users">
                    [No users in database right now]
                </motion.section> : filteredUsers?.map((user,idx) => (
                    <motion.section 
                        className="database-info"
                        key={user.id} 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        <span style={{ fontSize: "13px",color:"var(--text-color)"}}> @{user?.username} ({user.id})
                        
                        </span>

                        <button onClick={(e)=>{updateChanges(user.id , "is_banned", !user.is_banned)}} className="database-info-button-ban">
                            {user.is_banned ?
                                <UnBanSVG style={{height:"100%",width:"100%",fill:"var(--text-color)"}}/>
                                :
                                <BanSVG style={{height:"100%",width:"100%",fill:"var(--text-color)"}}/>
                            }
                        </button>

                    </motion.section>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isChanged && !usersCopy.some(u => !u.username || u.username.trim() === "")    && (
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

                    <button onClick={(e)=>setUsersCopy(users)} style={{backgroundColor:"var(--cancel-button-color)",color:"var(--text-color)"}}>
                        Cancel
                    </button>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
        )
}


export default Database;
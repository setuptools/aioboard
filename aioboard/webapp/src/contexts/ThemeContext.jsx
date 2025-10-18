import React from "react";
import { useEffect, useState, useRef ,useContext,createContext} from "react";
import { NavLink } from "react-router-dom";

import axios from 'axios';

const ThemeContext = createContext();

export const ThemeProvider = ({children})=>{
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    };  

    

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
  return useContext(ThemeContext);
}
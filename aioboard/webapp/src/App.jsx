import React, { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import Main from "./pages/Main.jsx";
import Logger from "./pages/Logger.jsx";
import Commands from './pages/Commsnds.jsx';
import Database from './pages/Database.jsx';
import Handlers from './pages/Handlers.jsx';


import Sidebar from "./layouts/Sidebar.jsx";

function App() {

    return (
        <div className="app-container">
            <Sidebar/>


            <div className="container">
                <Routes>
                    <Route path = "/" element={<Main/>} />
                    <Route path = "/database" element={<Database/>} />
                    <Route path = "/logger" element={<Logger/>} />
                    <Route path = "/commands" element={<Commands/>} />
                    <Route path = "/handlers" element={<Handlers/>} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
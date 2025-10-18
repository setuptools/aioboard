
import re
from typing import Any, Optional , Union
from aiogram import Bot,Dispatcher, F, Router, BaseMiddleware
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.base import BaseSession
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import Message,CallbackQuery

from dataclasses import asdict
from pathlib import Path

import logging

from functools import wraps

import os 
import sys
import asyncio
import threading
import aiosqlite


from datetime import datetime


from .utils.web_app import WebApp


class AioboardLogger(BaseMiddleware):
    def __init__(self, web_app:WebApp) -> None:
        super(AioboardLogger, self).__init__()

        self.web_app = web_app
        self.events_queue =  web_app.app.config["events_queue"]

    async def __call__(self, handler, event, data):
        self.events_queue =  self.web_app.app.config["events_queue"]
        users = self.web_app.app.config["users"]
        _handlers = self.web_app.app.config["handlers"]
        
        db_interactions = self.web_app.app.config["db_interactions"]
        db = self.web_app.app.config["db"]

        users_ids = [user.id for user in users]

        if event.message:
            msg = event.message
            user = msg.from_user
            await self.events_queue.put({
                "type": "message",
                "from": msg.from_user.__dict__,
                "chat":msg.chat.__dict__,
                "data": msg.text
            })

            if msg.from_user.id not in users_ids:
                users.append(msg.from_user)

                if db_interactions:
                    await db.execute("""
                                      INSERT OR IGNORE INTO USERS (id,username,first_name,language_code,is_premium,is_banned,role) VALUES (?,?,?,?,?,?,?)""",
                                      (user.id,user.username,user.first_name,user.language_code,user.is_premium,False,"user"))
                    await db.commit()
        
            

        elif event.callback_query != None:
            cb = event.callback_query
            user = cb.from_user
            await self.events_queue.put({
                "type": "callback",
                "from":cb.from_user.__dict__,
                "chat":cb.message.chat.__dict__,
                "data": cb.data
            })
            if cb.from_user.id not in users_ids:
                users.append(cb.from_user)

                if db_interactions:
                    await db.execute("""
                                      INSERT OR IGNORE INTO USERS (id,username,first_name,language_code,is_premium,is_banned,role) VALUES (?,?,?,?,?,?,?)""",
                                      (user.id,user.username,user.first_name,user.language_code,user.is_premium,False,"user"))
                    await db.commit()


        return await handler(event, data) 

class Aioboard(Bot):


    users_list = []
    events_list = []

    def __init__(self, 
                 token: str, 
                 session: BaseSession | None = None, 
                 default: DefaultBotProperties | None = None, 
                 enable_logging:bool = False,
                 show_info:bool = True,
                 clear_after_start:bool = True,

                 username:str="root",
                 password:str="aioboardadmin!",
                 white_list:list = [],
                 black_list:list = [],

                 db_engine: Union["aqiosqite","mongoengine"] = "aiosqlite", # IN DEVELOPMENT

                 db_interactions: bool = True, # On/off database intreactions
                 **kwargs: Any,
                 ) -> None:
        super(Aioboard,self).__init__(token, session, default, **kwargs)

        os.system("cls" if os.name == "nt" else "clear") if clear_after_start else None

        # token
        self._token = token

        # options
        self._enable_logging = enable_logging
        self._show_info = show_info
        self._clear_after_start = clear_after_start
        self._db_interactions = db_interactions
        self._db_engine = db_engine

        self._username = username
        self._password = password
        self._white_list = white_list
        self._black_list = black_list

        # create webapp

        self.web_app = WebApp(bot = self)
        self.web_app.app.config["handlers"]=[]


        # bot dispatcher
        self.dispatcher = Dispatcher()

        # set logger
        self.logger = logging.getLogger("AIOBOARD")
        self.logger.setLevel(logging.DEBUG)

        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)

        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S")
        
        console_handler.setFormatter(formatter)

        self.logger.addHandler(console_handler)

    def listen_wrapper(self, func):
        # найти реально выполняемый хендлер через router и фильтры
        @wraps(func)
        async def wrapper(*args, **kwargs):
            _handlers = self.web_app.app.config["handlers"]
            for h in _handlers:
                for child in h["handlers"]:
                    if child.get("name") == func.__name__ and not child.get("work", True):
                        return 
            # можно динамически блокировать выполнение
            return await func(*args, **kwargs)
        return wrapper


    async def _load_database(self):


        self._db = await aiosqlite.connect("default.db")
        self._db.row_factory = aiosqlite.Row  
        self._db_cursor = self._db.cursor()


        await self._db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                language_code TEXT,
                is_premium INTEGER DEFAULT 0,
                is_banned INTEGER DEFAULT 0,
                role TEXT DEFAULT 'user'
            );
            """)
    
        await self._db.commit()

        self.web_app.app.config["db"] = self._db
        self.web_app.app.config["db_interactions"] = self._db_interactions
        self.web_app.app.config["users"] = []


    async def _register_handles(self, handler, event, data):
        ...

    async def _explore_dispatcher(self,dp: Dispatcher):
        _handles = []

        async def _walk(router, indent=0):
            pad = " " * indent
            for event_name, observer in router.observers.items():
                _handles.append({"name":event_name,"handlers":[hdl.callback.__name__ for hdl in observer.handlers]})

            for sub in router.sub_routers:
                await _walk(sub, indent + 1)

        await _walk(self.dispatcher)
    
        return _handles

    async def _on_startup(self):
        bot_info = await self.get_me()

        routes = await self._explore_dispatcher(self.dispatcher)

        _routes_text = ""

        for route in routes:
            _routes_text += f"| ✅ {route['name']} ({len(route['handlers'])})\n"

            for handler in route["handlers"]: 
                _routes_text += f"|    ✅ {handler}\n"

        print(f"""
| ✅ Bot is online
|
| 🎮 Name: {bot_info.full_name}
| 👤 Username: https://t.me/{bot_info.username}
| 📅 Date: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}
|
| ⚙️ Options:
|    🪵 Logging: {self._enable_logging}
|    ℹ️ Show info: {self._show_info}
|    🧼 Clear after start: {self._clear_after_start}
|
| 📍 Routes ({len(routes)}):
|
{_routes_text}\n""")    


    async def run(self):
        self.dispatcher.update.middleware(AioboardLogger(self.web_app))
        await self._load_database()
        await self._on_startup() if self._show_info else None

        # make routes

        server_task = asyncio.create_task(self.web_app.run())
        bot_task = asyncio.create_task(self.dispatcher.start_polling(self))

        try:
            await asyncio.gather(server_task, bot_task)
        except asyncio.CancelledError:
            print("Tasks cancelled")
        finally:
            await self.close() 
                
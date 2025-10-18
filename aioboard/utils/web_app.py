
from waitress import serve , create_server
from quart import Quart, jsonify
from quart_cors import cors
from aiogram import Bot

import quart

import os

import asyncio
import sys
import netifaces
import webbrowser
import threading
import importlib


from .routes.bot import __blueprint__ as bot_blp
from .routes.logger import __blueprint__ as log_blp
from .routes.another import __blueprint__ as an_blp

from hypercorn.asyncio import serve
from hypercorn.config import Config

class WebApp:
    def __init__(self, bot) -> None:

        self.bot:Bot = bot
        self.app = Quart(__name__)
        self.app.config["bot"] = bot
        self.app = cors(self.app, allow_origin="*")
        self.server = None
        self.ips = []   

        self.events_queue = asyncio.Queue()
        self.app.config["events_queue"]= self.events_queue

        self.path = os.path.abspath(os.path.join(os.path.dirname(__file__),"../utils/routes"))


    def _get_sockets(self):
        ips = []
        for iface in netifaces.interfaces():
            addrs = netifaces.ifaddresses(iface)
            if netifaces.AF_INET in addrs:
                for link in addrs[netifaces.AF_INET]:
                    ips.append(link['addr'])
        return ips


    async def _routes(self):
        

        @self.app.route("/")
        def main():
            return "Work ok!"


        # load routeres from dir
        self.app.register_blueprint(bot_blp)
        self.app.register_blueprint(log_blp)
        self.app.register_blueprint(an_blp)


    async def run(self):
        await self._routes()

        # webbrowser.open_new("http://127.0.0.1:3000")

        # self.server = create_server(self.app,host="0.0.0.0", port=3011)
        print(self._get_sockets())

        # self.server.run()
        config = Config()
        config.bind = ["127.0.0.1:3011"]
        config.use_reloader = True
        config.debug = True 
        config.handle_signals = False

        # server_task = await serve(self.app, config)
        await self.app.run_task(port=3011, debug=True)


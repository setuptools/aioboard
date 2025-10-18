from quart import Blueprint , current_app , jsonify , request , Websocket , send_file

from aiogram.types import Message, CallbackQuery, BotCommand

import quart
import os
import asyncio

import subprocess

__blueprint__ = Blueprint("another",__name__,url_prefix = "/api/another")




@__blueprint__.get("/getReadME")
async def open_readme():
    try:

        file = os.path.abspath(os.path.join(os.path.dirname(__file__),"../../../README.md"))


        return await send_file(
            file, 
            attachment_filename="README.md", 
            as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)})
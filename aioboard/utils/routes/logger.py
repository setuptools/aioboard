from quart import Blueprint , current_app , jsonify , request , websocket
from aiogram.types import Message, CallbackQuery 
from aiogram import F

import quart
import os
import asyncio




__blueprint__ = Blueprint("logger",__name__,url_prefix = "/api/logger")


events_list = []

@__blueprint__.websocket("/botLogger")
async def handlers():
    await websocket.accept()

    events_queue = current_app.config["events_queue"]

    try:
        while True:
            event = await events_queue.get()
            events_list.append(event)
            await websocket.send_json(event)

    except Exception as e:
        print(e)
        await websocket.close(1)


@__blueprint__.get("/botLogs")
async def getAllHandlers():    
    try:

        return jsonify(events_list)
    except Exception as e:
        print(e)
        return {"error":404}
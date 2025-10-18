import trace
from quart import Blueprint , current_app , jsonify , request , Websocket
from aiogram.types import Message, CallbackQuery, BotCommand , BotCommandScopeUnion , BotCommandScopeDefault , BotCommandScopeAllPrivateChats, BotCommandScopeAllGroupChats, BotCommandScopeAllChatAdministrators
from aiogram.methods.set_my_commands import SetMyCommands

import quart
import os
import asyncio

import traceback

__blueprint__ = Blueprint("bot",__name__,url_prefix = "/api/bot")



# bot avatar get

@__blueprint__.get("/getBotAvatar")
async def botAvatar():
    bot = current_app.config["bot"]
    
    me = await bot.get_me()
    photos = await bot.get_user_profile_photos(me.id)
    path = None

    if photos.total_count > 0:
        path = os.path.abspath(os.path.join(os.path.dirname(__file__),"../../webapp/data/icons/bot_avatar.png"))
    
        file_id = photos.photos[0][-1].file_id  # Самая большая версия первой фотографии

        # Получаем File object
        file = await bot.get_file(file_id)

        # Скачиваем файл через bot.download_file
        await bot.download_file(file.file_path, destination=path)
    
    else:
            return await quart.send_file(
            os.path.abspath(os.path.join(
                os.path.dirname(__file__),
                "../../webapp/data/icons/bot_non_avatar.png"
            )),
            mimetype="image/png"
        )


    return await quart.send_file(path,mimetype="image/png")



# users

@__blueprint__.get("/getBotUsers")
async def botUsers():
    try:

        db_cursor = current_app.config["db"]

        users = []
        users.extend(current_app.config["users"])


        users_id = [user["id"] for user in users] if users else []
        users.extend([dict(user) for user in await (await db_cursor.execute("SELECT * FROM users")).fetchall() if dict(user)["id"] not in users_id])


        if users != []:
            return users
        
        return []

    except Exception as a:
        print(a)
        return {"status":400}


@__blueprint__.post("/editBotUsers")
async def editBotUser():
    try:
        data = await request.get_json()
        db_cursor = current_app.config["db"]

        for user in data["users"]:
            await db_cursor.execute(f"UPDATE users SET is_premium = ? , is_banned = ? , role = ? WHERE id = ?", (user["is_premium"], user["is_banned"], user["role"], user["id"]))
            await db_cursor.commit()
            return {"status":200}
        
        return {"status":403}

    except Exception as a:
        print(a)
        traceback.print_exc()
        return {"error":403}

# bot info

@__blueprint__.get("/getBotInfo")
async def botInfo():
    try:
        bot = current_app.config["bot"]

        me = await bot.get_me()

        commands = [{"name":x.command,"description":x.description} for x in await bot.get_my_commands()]

        _json = me.__dict__.copy()
        _json["token"] = bot._token
        _json["description"] = (await bot.get_my_description()).description
        _json["short_description"] = (await bot.get_my_short_description()).short_description
        _json["commands"] = commands
        return jsonify(_json)

    except Exception as a:
        print(a)
        return {"error":400}


@__blueprint__.get("getBotHandlers")
async def botHandlers():
    
    try:
        bot = current_app.config["bot"]
        handlers = current_app.config["handlers"] 

        _handles = []

        async def _find_handler_work(router_id):
            for handler in handlers:
                for child in handler["handlers"]:
                    if child["name"] == router_id:
                        return child.get("work", False)
            
            return True

        async def _walk(router, indent=0):
            pad = " " * indent
            for event_name, observer in router.observers.items():
                _handles.append({"name":event_name,"handlers":[{"name":hdl.callback.__name__, "work":await _find_handler_work(hdl.callback.__name__)} for hdl in observer.handlers]})

            for sub in router.sub_routers:
                await _walk(sub, indent + 1)

        await _walk(bot.dispatcher)
    
        return {"data":_handles}

    except Exception as a:
        return {"error":403}

@__blueprint__.route("/editBotValue",methods=["POST"])
async def newName():

    try:
        data = await request.get_json()
        bot = current_app.config["bot"] 
        

        if data["value"] != "":
            if data["field"] == "first_name":
                await bot.set_my_name(data["value"])
                return {"status":200}
        
            elif data["field"] == "description":
                await bot.set_my_description(data["value"])
                return {"status":200}
            
            elif data["field"] == "commands":
                new_commands = [BotCommand(command=command["name"], description=command["description"]) for command in data["value"]]
                await bot(SetMyCommands(commands=new_commands, scope=BotCommandScopeAllPrivateChats()))

                return {"status":200}
        
            elif data["field"] == "handlers":
                current_app.config["handlers"] = data["value"]
                return {"status":200}


        return {"status":403}

    except Exception as a:
        print(a)
        return {"error":403}
    



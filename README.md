# aioboard

aioboard — это модуль для управления Telegram-ботами с удобной панелью управления. Он позволяет запускать бота, отслеживать логи, управлять командами, пользователями и хэндлерами через встроенную маленькую базу данных.

##  Возможности:

- 🚀 Запуск и остановка Telegram-бота

- 📜 Просмотр логов работы бота в реальном времени

- ⚙ Управление командами бота

- 👥 Управление пользователями через встроенную БД

- 🔧 Управление хэндлерами бота

- 🗄 Лёгкая интеграция и простая настройка

## Установка

клонирование репозитория

`git clone https://github.com/setuptools/aioboard.git`

установка модуля

`pip install .`

для уставноки node_modules надо перейти в папку `./web_app` и прописать команду

`npm install .`

## Быстрый старт


```
from aioboard import Aioboard
import asyncio

from aiogram import F , Router , types


async def main():
    __bot__ = Aioboard(token = "YOUR_TOKEN" , show_info =False)
    router = Router()

    @router.message(F.text)
    @__bot__.listen_wrapper
    async def message_and_xuy(message):
        await message.answer("Hello!")
       
    @router.callback_query()
    @__bot__.listen_wrapper
    async def _update(callback:types.CallbackQuery):
        await callback.answer("Good")

    __bot__.dispatcher.include_router(router)
    await __bot__.run()
    

if __name__ == "__main__":
    
    asyncio.run(main())

```



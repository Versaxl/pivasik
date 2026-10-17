# Summer Servers — Совёнок

Агрегатор серверов «Бесконечного Лета».

## Локальный запуск
npm install
npm start
# http://localhost:3000

## Деплой на Render
1. Пуш в GitHub
2. New Web Service → подключить репозиторий
3. Build: `npm install`, Start: `npm start`
4. Готово

## Структура
- `data/servers.json` — серверы, новости, правила
- `public/` — фронтенд
- `server.js` — Express-сервер
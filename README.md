# Konnect frontend

React + Redux Toolkit + Tailwind (Vite, plain JavaScript) for the Konnect Spring Boot backend.

1. Start the backend on port 8080.
2. `npm install`
3. `npm run dev` and open http://localhost:5173

In development Vite proxies `/api` to `http://localhost:8080`, so no CORS config is needed.
For a deployed build, set `VITE_API_URL` and enable CORS on the backend.

Endpoints used: POST /api/clients, POST /api/rooms, GET /api/rooms/{code},
GET and POST /api/rooms/{code}/messages, DELETE /api/rooms/{code}/messages/{id} (header X-Client-Token).

You can delete your own messages: a "Delete" link (with a Yes/No confirm) shows under messages you sent. The
server checks your token against the one that sent the message, and returns 403 for anyone else.

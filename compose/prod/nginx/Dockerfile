FROM node:20-alpine AS builder

ENV VITE_API_URL=https://api.tower-empire.org/api/
ENV VITE_WS_URL=wss://api.tower-empire.org/ws/lobby/
ENV VITE_WS_CHAT_URL=wss://api.tower-empire.org/ws/chat/
WORKDIR /app
COPY package*.json ./
# Если есть lockfile — npm ci; если нет — fallback на npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Копируем исходники и собираем
COPY . .
# Vite собирает в outDir=build (см. vite.config.mjs)
RUN npm run build -- --mode production

# ---------- Runtime ----------
FROM nginx:alpine

# Копируем статический артефакт сборки (из builder: /app/build)
COPY --from=builder /app/build /usr/share/nginx/html
# Твой конфиг nginx
COPY compose/prod/nginx/default.conf /etc/nginx/conf.d/default.conf

# Продовый env 
ENV NODE_ENV=production

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

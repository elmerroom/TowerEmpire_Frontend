FROM node:20-alpine AS builder

# Я добавил эту переменную для dev сборки 
ENV NODE_ENV=development 
ENV GENERATE_SOURCEMAP=false
ENV VITE_API_URL=https://api.dev.tower-empire.org
ENV VITE_WS_URL=wss://api.dev.tower-empire.org/ws/lobby/
ENV VITE_WS_CHAT_URL=wss://api.dev.tower-empire.org/ws/chat/
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Собираем для DEV
RUN npm run build  -- --mode development 

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY compose/dev/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
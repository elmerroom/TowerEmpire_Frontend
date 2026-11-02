FROM node:20-alpine

COPY ./compose/local/node/start.sh /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

WORKDIR /app

CMD ["/start"]

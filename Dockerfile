FROM node:latest
RUN mkdir -p /home/www/koa
WORKDIR /home/www/koa
COPY . /home/www/koa
RUN npm install
EXPOSE 3000
CMD ["node","src/server.js"]
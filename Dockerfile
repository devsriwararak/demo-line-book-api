FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DB_USER=root
ENV DB_HOST=203.146.252.205
ENV DB_DATABASE=line-db
ENV DB_PASSWORD=5839011223
ENV DB_PORT=5432
ENV JWT_SECRET="booking_app"

EXPOSE 3000

CMD ["npm", "start"]
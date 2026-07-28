FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8089

# Render sets PORT dynamically; app reads process.env.PORT || 8089
CMD ["npm", "start"]

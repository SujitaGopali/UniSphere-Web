FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Include all deps (tsx is required by `npm start` even if NODE_ENV=production)
RUN npm install --include=dev

COPY . .

EXPOSE 8089

# Render sets PORT dynamically; app reads process.env.PORT || 8089
CMD ["npm", "start"]

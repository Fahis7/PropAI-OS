FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port 5173
EXPOSE 5173

# Start the server
CMD ["sh", "-c", "npm install && npm run dev -- --host"]
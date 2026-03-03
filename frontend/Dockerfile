FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port 5173
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
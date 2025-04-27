# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port (not strictly needed for Railway but helpful)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

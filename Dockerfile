# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Expose the port on which the application will run
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]

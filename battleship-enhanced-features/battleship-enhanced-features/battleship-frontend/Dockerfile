# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and the pnpm lockfile
COPY package.json pnpm-lock.yaml ./

# Install project dependencies
RUN pnpm install

# Copy the rest of the application's source code
COPY . .

# Make port 5173 available
EXPOSE 5173

# Run the app's dev server
CMD ["pnpm", "run", "dev", "--host"]
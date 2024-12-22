FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . ./

# Build the application
RUN npm run build

# Expose the backend and frontend ports
EXPOSE 3000
EXPOSE 5173

# Start both backend and frontend
CMD ["sh", "-c", "npm run start & npm run dev"]


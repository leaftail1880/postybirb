# Use a suitable Node.js base image
FROM node:lts-stretch

# Install system dependencies for Electron and Xvfb
RUN apt-get update && apt-get install -yq --no-install-suggests --no-install-recommends \
    g++ \
    libgtk2.0-0 \
    libgtk2.0-dev \
    xvfb \
    libxtst6 \
    libgbm-dev \
    libxss1 \
    libnss3 \
    libasound2 \
    libgconf-2-4 \
    git \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdbus-1-dev \
    libavahi-compat-libdnssd-dev

# Create an application directory
WORKDIR /app

# Copy application code (make sure you have your package.json here)
COPY . .

# Install application dependencies
RUN npm install
# If you use native modules, run electron-rebuild to ensure compatibility with the installed Electron version
RUN npx electron-rebuild

# Add a non-root user and switch to it for security
RUN useradd -m appuser
USER appuser

# Create an entrypoint script to start Xvfb and your app
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Define the command to run when the container starts
CMD ["npm", "start"] 
# or directly execute your app: CMD ["electron", "your_main.js"]

#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Category Management Backend Startup  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with the following variables:"
    echo "  PORT=8000"
    echo "  MONGODB_URL=your_mongodb_connection_string"
    echo "  JWT_SECRET=your_jwt_secret_key"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Stop and remove existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker-compose down

# Build and start containers
echo -e "${BLUE}Building and starting containers...${NC}"
docker-compose up --build -d

# Check if containers started successfully
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Backend started successfully! 🚀     ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "API is running at: ${BLUE}http://localhost:8000${NC}"
    echo ""
    echo "Available commands:"
    echo -e "  - View logs:        ${BLUE}docker-compose logs -f app${NC}"
    echo -e "  - Stop containers:  ${BLUE}docker-compose down${NC}"
    echo -e "  - Restart:          ${BLUE}docker-compose restart${NC}"
    echo ""
else
    echo -e "${RED}Failed to start containers!${NC}"
    echo "Check the error messages above for details."
    exit 1
fi

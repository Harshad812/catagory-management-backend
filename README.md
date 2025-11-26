# Multi-Level Category Management API

A robust Node.js backend API built with Express and TypeScript for managing hierarchical categories with JWT authentication.

## 🚀 Features

- **JWT Authentication** - Secure user registration and login
- **Multi-Level Categories** - Unlimited nesting depth with parent-child relationships
- **Tree Structure API** - Fetch categories in hierarchical format
- **Cascading Updates** - Inactive status propagates to all descendants
- **Smart Deletion** - Children reassigned to grandparent on category deletion
- **MongoDB Indexes** - Optimized queries for performance
- **Comprehensive Tests** - Unit and integration tests with Jest
- **TypeScript** - Full type safety and better developer experience

## 📋 Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd catagory-management-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URL=mongodb+srv://your-username:your-password@cluster.mongodb.net/category-management
JWT_SECRET=secret-jwt-key
NODE_ENV=development
```

**Important:** Replace the MongoDB URL with your actual credentials and change the JWT_SECRET to a secure random string.

### 4. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8000`

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 📚 API Documentation

For detailed API documentation, including authentication and category endpoints, please refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🏗️ Project Structure

```
src/
├── __tests__/                  # Unit and integration tests
├── config/                     # Configuration files
├── controllers/                # Request handlers
├── middleware/                 # Express middleware
├── models/                     # Mongoose models
├── routes/                     # API routes
├── utils/                      # Utility functions
└── app.ts                      # App entry point
```

## 🧩 Technologies Used

- **Node.js** & **Express.js**
- **TypeScript**
- **MongoDB** & **Mongoose**
- **JWT** & **bcryptjs**
- **Jest** & **Supertest**

## � Docker Support

Quick start with Docker:

```bash
./start.sh
```

Stop containers:

```bash
docker-compose down
```

## 📝 License

MIT

## 👨‍💻 Author

Harshad

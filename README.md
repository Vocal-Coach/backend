# Vocal Coach Server 🎤

> A backend API server for voice training and vocal practice

[![NestJS](https://img.shields.io/badge/NestJS-11.0-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)

## 📋 What is this?

Vocal Coach Server is a REST API server for voice training and vocal practice. It helps users with sign up, login, training programs, and tracking results.

## 📖 API Docs (Swagger)

**🚀 Quick Start**: After running the server, check out the interactive API docs here!

- **Local Development**: http://localhost:3000/api
- **Production**: `{your-domain}/api`

> 💡 **Tip**: You can set your JWT token directly in Swagger UI and test all APIs in real time.

### What Swagger Can Do

- 🔍 **Browse all API endpoints** in real time
- 🧪 **Test APIs** right in your browser
- 🔐 **Set JWT authentication** easily
- 📝 **Auto-generated docs** for requests and responses
- 💼 **Detailed explanations** of how things work

## ✨ Main Features

- 🔐 **User Authentication**: Sign up and login with JWT tokens
- 👤 **User Management**: Handle user profiles and gender info
- 🎯 **Training Management**: Create, edit, and delete voice training programs by level
- 📊 **Result Tracking**: Record training results and manage scores
- 📖 **API Documentation**: Auto-generated docs with Swagger
- 🔒 **Data Validation**: Check input data with Class Validator

## 🏗️ Tech Stack

**Backend Framework**

- NestJS 11.0 (Node.js)
- TypeScript 5.7

**Database**

- PostgreSQL 16
- TypeORM (Object-Relational Mapping)

**Authentication**

- JWT (JSON Web Token)
- Passport.js
- bcrypt (password encryption)

**API Documentation**

- Swagger (OpenAPI 3.0)

**DevOps**

- Docker & Docker Compose
- GitHub Actions (CI/CD)

## 🚀 Quick Start

### What You Need

- Node.js 20+
- Docker & Docker Compose
- Git

### How to Install and Run

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd vocal-coach-server
   ```

2. **Set up environment variables**

   ```bash
   # Create .env file
   cp .env.example .env

   # Edit environment variables
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=postgres
   ```

3. **Run with Docker Compose**

   ```bash
   docker compose up --build
   ```

4. **Run in development mode** (for local development)

   ```bash
   # Install dependencies
   yarn install

   # Run only PostgreSQL container
   docker compose up postgres -d

   # Start development server
   yarn dev
   ```

### Access the Server

- **API Server**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## 📚 API Structure

### Authentication (Auth)

- `POST /auth/register` - Sign up
- `POST /auth/login` - Log in

### User

- `GET /user` - Get user info (coming soon)

### Training

- `GET /training` - Get list of trainings
- `GET /training?id={id}` - Get specific training
- `POST /training` - Create new training
- `PATCH /training?id={id}` - Update training
- `DELETE /training?id={id}` - Delete training

### Training Results

- `GET /training-result` - Get my training results
- `GET /training-result?id={id}` - Get specific result
- `GET /training-result?trainingId={id}` - Get results for specific training
- `POST /training-result` - Record training result
- `PATCH /training-result?id={id}` - Update result
- `DELETE /training-result?id={id}` - Delete result

## 🗄️ Database Structure

### User

```typescript
{
  id: number;
  email: string(unique);
  passwordHash: string;
  displayName: string(unique);
  gender: "male" | "female";
  createdAt: Date;
  updatedAt: Date;
}
```

### Training

```typescript
{
  id: number;
  title: string;
  level: number; // 1: beginner, 2: intermediate, 3: advanced
  data: string; // JSON training data
  createdAt: Date;
  updatedAt: Date;
}
```

### TrainingResult

```typescript
{
  id: number;
  training: Training(관계);
  user: User(관계);
  score: number(0 - 100);
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) based authentication.

1. **Sign up or log in** to get your token
2. **Include Bearer token** in Authorization header
   ```bash
   Authorization: Bearer <your-jwt-token>
   ```

### Examples

```bash
# Sign up
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "displayName": "John Doe",
    "gender": "male"
  }'

# Log in
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Call API that needs authentication
curl -X GET http://localhost:3000/training \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🛠️ Development

### Scripts

```bash
# Development server (watch mode)
yarn dev

# Build for production
yarn build

# Run production
yarn start:prod

# Lint code
yarn lint

# Format code
yarn format

# Run tests
yarn test
yarn test:watch
yarn test:cov
```

### Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── guard/           # Auth guards
│   ├── strategy/        # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── user/                # User module
│   ├── entities/        # User entity
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
├── training/            # Training module
│   ├── dto/             # DTOs
│   ├── entities/        # Training entity
│   ├── training.controller.ts
│   ├── training.service.ts
│   └── training.module.ts
├── training-result/     # Training result module
│   ├── dto/             # DTOs
│   ├── entities/        # Training result entity
│   ├── training-result.controller.ts
│   ├── training-result.service.ts
│   └── training-result.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts              # Application entry point
```

## 🚀 Deployment

### Auto Deploy with GitHub Actions

Push to `main` branch to auto deploy to EC2.

**Required GitHub Secrets:**

- `EC2_HOST`: EC2 instance IP
- `EC2_USER`: EC2 username (default: ec2-user)
- `EC2_PRIVATE_KEY`: EC2 SSH private key
- `PORT`: Application port
- `JWT_SECRET`: JWT secret key
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name

### Manual Deploy

```bash
# Build Docker image
docker build -t vocal-coach-server .

# Run container
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e POSTGRES_HOST=your-db-host \
  vocal-coach-server
```

## 📖 API Documentation

We provide interactive API docs through Swagger UI.

- **Local**: http://localhost:3000/api
- **Features**: Test all endpoints directly
- **Authentication**: Set JWT tokens right in the UI

## 🧪 Testing

```bash
# Unit tests
yarn test

# Test in watch mode
yarn test:watch

# Test with coverage
yarn test:cov

# End-to-end tests
yarn test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is UNLICENSED.

## 🆘 Troubleshooting

### Common Problems

**1. Database connection fails**

```bash
# Check PostgreSQL container status
docker compose ps

# Check logs
docker compose logs postgres
```

**2. Port conflicts**

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5432

# Change port in .env file
PORT=3001
```

**3. JWT token expired**

- Tokens expire after 30 days
- Log in again to get a new token

### Check Logs

```bash
# Application logs
docker compose logs nestjs-app

# Database logs
docker compose logs postgres

# Watch logs in real time
docker compose logs -f
```

## 🔮 Future Plans

- [ ] User profile update API
- [ ] Training category system
- [ ] Real-time training sessions
- [ ] Training progress tracking
- [ ] Social login (Google, Facebook)
- [ ] File upload (voice files)
- [ ] Voice analysis features
- [ ] Push notifications
- [ ] Admin dashboard

---

**Contact**: If you have questions or issues, please use GitHub Issues.

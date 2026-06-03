# FinVault

![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens)

FinVault is a full-stack web application designed for tracking investments and analyzing portfolio performance. I built this project to provide a single, unified dashboard for managing multiple asset classes—including stocks, mutual funds, cryptocurrency, and real estate—backed by real-time market data.

## Features

- **Asset Management**: Track diverse assets including stocks, crypto, mutual funds, fixed deposits, and real estate.
- **Real-Time Data**: Live market pricing integrated via Yahoo Finance and CoinGecko, with AlphaVantage serving as a fallback.
- **Portfolio Analytics**: View your P&L, return percentages, and asset allocation breakdowns through interactive charts.
- **Authentication**: Secure, stateless user sessions using JWT and Spring Security.
- **Modern UI**: Fully responsive frontend with dark/light mode support, built with React and Tailwind CSS.

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.0, Spring Security, Spring Data JPA, Hibernate
- **Database**: MySQL 8.0
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React
- **External APIs**: Yahoo Finance, CoinGecko, AlphaVantage

## Local Setup

### 1. Database Configuration
Create a local MySQL database named `fintech_portfolio`:
```sql
CREATE DATABASE fintech_portfolio;
```
Update the database credentials in `server-spring/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fintech_portfolio
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 2. Backend
Navigate to the `server-spring` directory. If you want to use the fallback APIs, add your keys to `application.properties`:
```properties
alphavantage.api-key=YOUR_KEY
coingecko.api-key=YOUR_KEY
```
Run the Spring Boot application:
```bash
mvn clean install
mvn spring-boot:run
```
The server will start on `http://localhost:4000`.

### 3. Frontend
Navigate to the `client` directory, install dependencies, and start the development server:
```bash
npm install
npm run dev
```
The client will be available at `http://localhost:5173`. Make sure the API base URL in `src/api/client.js` points to your local backend.

## Core API Endpoints

- `POST /api/auth/register` & `/login` - User authentication
- `GET /api/assets` - Retrieve user assets (supports `?enrich=true` for live prices)
- `POST /api/assets` - Add a new asset
- `GET /api/portfolio/summary` - Aggregated portfolio analytics and allocation
- `GET /api/search?q={query}` - Symbol search for stocks and crypto

## Deployment

The application is designed to be easily deployable to standard cloud hosting providers.

- **Backend**: Can be packaged into an executable JAR (`mvn clean package`) and run on any server supporting Java 17 (e.g., AWS EC2, Heroku, Railway).
- **Frontend**: Can be built into static files (`npm run build`) and hosted on platforms like Vercel, Netlify, or AWS S3.

*Note: Remember to update your CORS configurations in Spring Boot and API base URLs in the React client before deploying to production environments.*

## License

This project is licensed under the MIT License.
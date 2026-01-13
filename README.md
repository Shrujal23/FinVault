# FinVault - Portfolio Management System

A full-stack financial portfolio management application that enables users to track investments, manage assets, and analyze portfolio performance with real-time market data.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**
  - Secure JWT-based authentication
  - User registration and login
  - Password reset functionality
  - Session management

- **Portfolio Management**
  - Add, edit, and delete assets (Stocks, Mutual Funds, Cryptocurrency, Real Estate, Fixed Deposits, Cash/Gold)
  - Real-time portfolio valuation
  - Portfolio performance tracking over time
  - Asset allocation visualization (Pie charts)
  - Top gainers and losers tracking

- **Market Data Integration**
  - Real-time stock prices from Yahoo Finance API
  - Fallback to AlphaVantage API
  - Market news integration
  - Stock search functionality
  - Price history tracking

- **Analytics & Reporting**
  - Portfolio summary dashboard
  - Performance charts (line charts)
  - P&L calculations (Unrealized gains/losses)
  - Return percentage calculations
  - Portfolio snapshots for historical tracking

- **User Experience**
  - Dark/Light mode toggle
  - Responsive design (mobile-friendly)
  - Professional fintech UI design
  - Real-time data refresh
  - Watchlist functionality

## 🛠️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Security:** Spring Security with JWT
- **ORM:** Spring Data JPA / Hibernate
- **Database:** MySQL 8.0
- **Build Tool:** Maven
- **APIs:** RESTful Web Services

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** React Context API

### External APIs
- Yahoo Finance API (Stock quotes & search)
- AlphaVantage API (Market data fallback)
- CoinGecko API (Cryptocurrency data)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Java Development Kit (JDK) 17** or higher
- **Maven 3.6+**
- **Node.js 18+** and npm
- **MySQL 8.0+**
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/finvault.git
cd finvault
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE fintech_portfolio;
```

2. Update database credentials in `server-spring/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fintech_portfolio
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup

1. Navigate to the server directory:
```bash
cd server-spring
```

2. Update API keys in `src/main/resources/application.properties`:
```properties
# AlphaVantage API (Optional - for fallback)
alphavantage.api-key=YOUR_ALPHAVANTAGE_API_KEY

# CoinGecko API (Optional - for crypto data)
coingecko.api-key=YOUR_COINGECKO_API_KEY
```

3. Build and run the Spring Boot application:
```bash
mvn clean install
mvn spring-boot:run
```

The backend server will start on `http://localhost:4000`

### 4. Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Update API base URL in `src/api/client.js` if needed:
```javascript
const BASE_URL = "http://localhost:4000";
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 5. Build for Production

**Backend:**
```bash
cd server-spring
mvn clean package
java -jar target/fintech-server-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 📁 Project Structure

```
finvault/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── api/                # API client configuration
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   └── styles/             # CSS styles
│   ├── package.json
│   └── vite.config.js
│
├── server-spring/              # Spring Boot Backend
│   ├── src/main/java/com/fintech/
│   │   ├── config/             # Configuration classes
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── entity/             # JPA entities
│   │   ├── repository/         # Data repositories
│   │   ├── service/            # Business logic
│   │   └── SecurityConfig.java # Security configuration
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Assets
- `GET /api/assets` - Get all user assets
- `GET /api/assets?enrich=true` - Get assets with live prices
- `POST /api/assets` - Create new asset
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset

### Portfolio
- `GET /api/portfolio/summary` - Get portfolio summary
- `GET /api/portfolio/allocation` - Get asset allocation

### Market Data
- `GET /api/search?q={query}&type={type}` - Search stocks/crypto
- `GET /api/news` - Get market news

### Performance
- `GET /api/snapshots` - Get portfolio snapshots
- `GET /api/performance` - Get performance data

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/{symbol}` - Remove from watchlist

**Note:** All endpoints except `/api/auth/**` and `/api/news/**` require JWT authentication.

## 🔐 Security Features

- JWT-based stateless authentication
- Password hashing with BCrypt
- CORS configuration for frontend integration
- Spring Security filter chain
- Token expiration (7 days default)
- Secure password reset flow

## 🎨 UI Features

- **Professional Fintech Design**
  - Clean, modern interface
  - Muted color palette
  - Consistent typography
  - Professional data visualization

- **Dark/Light Mode**
  - System preference detection
  - Manual toggle option
  - Persistent theme selection

- **Responsive Design**
  - Mobile-friendly layout
  - Tablet optimization
  - Desktop experience

## 📊 Database Schema

### User Table
- `id` (Primary Key)
- `email` (Unique)
- `password_hash`
- `name`
- `reset_token`
- `reset_token_expiry`
- `created_at`
- `updated_at`

### Asset Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `type` (stock, mutual, crypto, etc.)
- `symbol`
- `name`
- `quantity`
- `avg_buy_price`
- `sector`
- `tags`
- `created_at`
- `updated_at`

### Watchlist Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `symbol`
- `created_at`

## 🧪 Testing

To run backend tests:
```bash
cd server-spring
mvn test
```

## 🚀 Deployment

### Backend Deployment
1. Build the JAR file: `mvn clean package`
2. Deploy to cloud platform (AWS, Heroku, etc.)
3. Configure environment variables for database and API keys
4. Set up MySQL database on cloud

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, AWS S3, etc.)
3. Update API base URL to production backend URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Developed as a portfolio project to demonstrate full-stack development skills with Spring Boot and React.

## 🙏 Acknowledgments

- Yahoo Finance for market data APIs
- AlphaVantage for financial data
- Spring Boot community
- React community

## 📸 Screenshots

Screenshots coming soon. The application features:
- Professional dashboard with portfolio overview
- Real-time asset management interface
- Interactive performance charts
- Responsive design for all devices

---

**Note:** This is a portfolio project. For production use, ensure proper security measures, error handling, and testing are implemented.

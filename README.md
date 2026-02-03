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

#### Option 1: Deploy to Heroku (Easiest)

**Prerequisites:**
- Heroku account (free tier available)
- Heroku CLI installed

**Steps:**

1. **Install Heroku CLI:**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku App:**
   ```bash
   cd server-spring
   heroku create your-app-name
   ```

4. **Add MySQL Database:**
   ```bash
   # Add ClearDB MySQL (free tier)
   heroku addons:create cleardb:ignite
   ```

5. **Get Database URL:**
   ```bash
   heroku config:get CLEARDB_DATABASE_URL
   ```

6. **Set Environment Variables:**
   ```bash
   heroku config:set SPRING_DATASOURCE_URL="jdbc:mysql://your-db-url"
   heroku config:set SPRING_DATASOURCE_USERNAME="your-username"
   heroku config:set SPRING_DATASOURCE_PASSWORD="your-password"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set ALPHAVANTAGE_API_KEY="your-api-key"
   ```

7. **Create Procfile:**
   Create `server-spring/Procfile`:
   ```
   web: java -jar target/fintech-server-0.0.1-SNAPSHOT.jar
   ```

8. **Deploy:**
   ```bash
   mvn clean package
   git init
   git add .
   git commit -m "Deploy to Heroku"
   heroku git:remote -a your-app-name
   git push heroku main
   ```

9. **Check Logs:**
   ```bash
   heroku logs --tail
   ```

#### Option 2: Deploy to AWS EC2

**Prerequisites:**
- AWS account
- EC2 instance running Ubuntu/Linux

**Steps:**

1. **Connect to EC2 Instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Java and Maven:**
   ```bash
   sudo apt update
   sudo apt install openjdk-17-jdk maven -y
   ```

3. **Install MySQL:**
   ```bash
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   ```

4. **Set up Database:**
   ```bash
   sudo mysql -u root -p
   CREATE DATABASE fintech_portfolio;
   CREATE USER 'fintech_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON fintech_portfolio.* TO 'fintech_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Clone and Build:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/finvault.git
   cd finvault/server-spring
   mvn clean package
   ```

6. **Create application.properties:**
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   nano src/main/resources/application.properties
   # Update with your database credentials
   ```

7. **Run Application:**
   ```bash
   # Using systemd service
   sudo nano /etc/systemd/system/finvault.service
   ```

   Add this content:
   ```ini
   [Unit]
   Description=FinVault Spring Boot Application
   After=syslog.target

   [Service]
   User=ubuntu
   ExecStart=/usr/bin/java -jar /home/ubuntu/finvault/server-spring/target/fintech-server-0.0.1-SNAPSHOT.jar
   SuccessExitStatus=143

   [Install]
   WantedBy=multi-user.target
   ```

   Start service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable finvault
   sudo systemctl start finvault
   sudo systemctl status finvault
   ```

8. **Configure Firewall:**
   ```bash
   sudo ufw allow 4000/tcp
   ```

#### Option 3: Deploy to Railway

**Steps:**

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add MySQL Database:**
   - Click "New" → "Database" → "MySQL"
   - Railway will provide connection string

4. **Configure Environment Variables:**
   - Go to Variables tab
   - Add:
     ```
     SPRING_DATASOURCE_URL=jdbc:mysql://...
     SPRING_DATASOURCE_USERNAME=...
     SPRING_DATASOURCE_PASSWORD=...
     JWT_SECRET=...
     ALPHAVANTAGE_API_KEY=...
     ```

5. **Deploy:**
   - Railway auto-detects Spring Boot
   - Builds and deploys automatically
   - Provides public URL

### Frontend Deployment

#### Option 1: Deploy to Vercel (Recommended - Free)

**Prerequisites:**
- Install Vercel Analytics package (already added to package.json)
- Analytics component is integrated in `main.jsx`

**Steps:**

1. **Install Dependencies:**
   ```bash
   cd client
   npm install
   # This will install @vercel/analytics package
   ```

2. **Update API URL:**
   Edit `client/src/api/client.js`:
   ```javascript
   const BASE_URL = "https://your-backend-url.herokuapp.com";
   ```

3. **Build Frontend:**
   ```bash
   npm run build
   ```

4. **Install Vercel CLI (if not installed):**
   ```bash
   npm install -g vercel
   ```

5. **Deploy:**
   ```bash
   cd client
   vercel
   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? Your account
   # - Link to existing project? No
   # - Project name? finvault-client
   # - Directory? ./
   # - Override settings? No
   ```

6. **Verify Analytics:**
   - After deployment, visit your site
   - Navigate between pages
   - Analytics will automatically start collecting data
   - Check Vercel dashboard → Analytics tab (data appears after 30 seconds)

7. **Update Environment Variables (if needed):**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `VITE_API_URL` if using Vite env vars

**Note:** Vercel Analytics is automatically enabled when you deploy. The `<Analytics />` component is already integrated in your app and will work automatically on Vercel deployments.

#### Option 2: Deploy to Netlify (Free)

**Steps:**

1. **Build Frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Or Deploy via Netlify Dashboard:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop `client/dist` folder
   - Or connect GitHub repo for auto-deploy

4. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Option 3: Deploy to GitHub Pages

**Steps:**

1. **Install gh-pages:**
   ```bash
   cd client
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://YOUR_USERNAME.github.io/finvault"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source: `gh-pages` branch
   - Save

### Complete Deployment Example (Heroku + Vercel)

**Backend (Heroku):**
```bash
# 1. Deploy backend
cd server-spring
heroku create finvault-backend
heroku addons:create cleardb:ignite
heroku config:set JWT_SECRET="your-secret"
mvn clean package
git push heroku main

# 2. Get backend URL
heroku info
# Note the URL: https://finvault-backend.herokuapp.com
```

**Frontend (Vercel):**
```bash
# 1. Update API URL
cd client
# Edit src/api/client.js to use: https://finvault-backend.herokuapp.com

# 2. Build and deploy
npm run build
vercel --prod
```

### Environment Variables Reference

**Backend Required Variables:**
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
JWT_SECRET=...
ALPHAVANTAGE_API_KEY=... (optional)
COINGECKO_API_KEY=... (optional)
```

**Frontend Configuration:**
- Update `client/src/api/client.js` with production backend URL
- Or use environment variables if configured

### Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Database connection is working
- [ ] Frontend can connect to backend API
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] SSL/HTTPS is enabled (most platforms provide this)
- [ ] Test authentication flow
- [ ] Test API endpoints
- [ ] Monitor logs for errors

### Troubleshooting

**Backend Issues:**
- Check logs: `heroku logs --tail` or `journalctl -u finvault`
- Verify database connection
- Check environment variables
- Ensure port is correctly configured

**Frontend Issues:**
- Check browser console for errors
- Verify API base URL is correct
- Check CORS settings on backend
- Clear browser cache

**Common Errors:**
- **CORS Error:** Update `cors.allowed-origins` in backend config
- **Database Connection:** Verify credentials and network access
- **Build Failures:** Check Java/Node versions match deployment platform

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

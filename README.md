# FinVault

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.2-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-authentication-black?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

FinVault is a full-stack investment portfolio application for tracking assets, monitoring dividends, viewing market data, and analyzing portfolio performance.

It is a personal portfolio tracker, not a brokerage, trading platform, or source of financial advice.

## Features

- JWT authentication with Spring Security.
- Portfolio and asset management for stocks, mutual funds, cryptocurrency, real estate, fixed deposits, and cash.
- Watchlists and dividend tracking.
- Portfolio summaries, allocation charts, performance history, and snapshots.
- Market search, news, sentiment, and price enrichment through external market-data providers.
- Password reset flow with hashed reset tokens.
- Per-user resource ownership checks and API rate limiting.
- Request correlation IDs, request duration/status logging, and Actuator health monitoring.
- Responsive React interface with Tailwind CSS, charts, and light/dark themes.

Live prices are fetched for stocks and crypto when providers respond. Mutual funds, real estate, fixed deposits, and cash use values you enter. Dividends are tracked with manual entries. Performance charts and snapshots currently use generated demo data rather than stored daily valuations.

## Proposed Future Features

The following features are planned improvements and are not currently included in the production workflow:

- **Broker integrations**: Connect supported brokerage accounts for secure portfolio synchronization.
- **Automated transaction imports**: Import trades, deposits, withdrawals, and fees from CSV and broker exports.
- **Advanced performance analytics**: Add time-weighted returns, internal rate of return, benchmark comparison, and tax-lot tracking.
- **Portfolio alerts**: Notify users about price targets, allocation drift, dividend payments, and unusual portfolio changes.
- **Dividend**: Implementation of automatic dividend tracking connected to the user is being planned. As of now only manual entry is being done.
- **Improved notifications**: Add email and push notification delivery through a managed provider.
- **Multi-currency portfolios**: Support currency conversion, exchange-rate tracking, and base-currency reporting.
- **More Assets**: As of now external market API is used for stocks and crypto. Other than that one has to use manual entry. Addition of more assets like FD, Real Estate, Gold and other's are in plan, without manual entry.
- **Stronger account security**: Add refresh-token rotation, session management, multi-factor authentication, and login notifications.
- **Operational dashboards**: Add centralized log aggregation, metrics, alerting, and distributed tracing for deployed environments.
- **Database migrations**: Replace automatic schema updates with versioned Flyway or Liquibase migrations.
- **Deployment automation**: Add CI checks for tests, dependency vulnerabilities, Docker image scanning, and automated deployments.

## Architecture

```text
Browser
  |
  v
Nginx :80
  |----------------------|
  v                      v
React static app       Spring Boot API :4000
                         |
                         v
                       MySQL :3306
```

The repository contains:

```text
client/          React + Vite frontend
server-spring/   Spring Boot REST API
docker-compose.yaml
nginx.conf       Reverse proxy configuration
.env.example     Environment template for Docker Compose
```

Architecture:

- [HIGH_LEVEL_DESIGN.md](HIGH_LEVEL_DESIGN.md)

## Technology Stack

- Java 17
- Spring Boot 3.3.2
- Spring Security, Spring Data JPA, Hibernate
- MySQL 8.4 in Docker
- React 18 and Vite
- Tailwind CSS and Recharts
- JWT
- Docker Compose and Nginx

## Prerequisites

For local development without Docker:

- Java 17 or newer
- Maven 3.9 or newer
- Node.js 20 or newer
- MySQL 8.x

For the containerized setup:

- Docker Desktop with the Linux engine running
- Docker Compose v2

## Option 1: Run With Docker Compose

The Compose file is safe to commit. Real credentials belong in `.env`, which is ignored by Git.

1. Create the local environment file:

```powershell
Copy-Item .env.example .env
```

2. Replace the local placeholder passwords and generate a private JWT secret. For example, with Git Bash or WSL:

```bash
openssl rand -base64 64
```

Put the generated value in `.env` as `JWT_SECRET`.

3. Validate the Compose configuration:

```powershell
docker compose config --quiet
```

4. Build and start the application:

```powershell
docker compose up --build -d
```

5. Open the application at:

```text
http://localhost
```

6. Check service health:

```powershell
docker compose ps
docker compose logs -f backend
```

Nginx on port 80 proxies `/api/` to Spring Boot and everything else to the React app. The backend port is not published on the host. MySQL is published on host port `3307` so it does not collide with a local MySQL install on `3306`.

Without Docker, Actuator is available at `http://localhost:4000/actuator/health`.

7. Stop the stack:

```powershell
docker compose down
```

To remove the local MySQL volume as well, use `docker compose down -v`. This deletes local database data.

## Option 2: Run Without Docker

### Database

Create a MySQL database and user, then configure the ignored file `server-spring/src/main/resources/application.properties`. Start with the committed template:

```powershell
Copy-Item server-spring/src/main/resources/application.properties.example server-spring/src/main/resources/application.properties
```

Set at least these values:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fintech_portfolio
spring.datasource.username=your_database_user
spring.datasource.password=your_database_password
jwt.secret=your_base64_encoded_secret
```

Never commit the real `application.properties` file or real API keys.

### Backend

From the repository root:

```powershell
mvn -f server-spring/pom.xml test
mvn -f server-spring/pom.xml spring-boot:run
```

The API runs at `http://localhost:4000`.

### Frontend

In another terminal:

```powershell
Set-Location client
npm ci
npm run dev
```

The development frontend runs at `http://localhost:5173`. Vite talks to the API using the value in `VITE_API_BASE` when set; otherwise the client uses the local backend origin.

## Useful API Endpoints

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/auth/reset-password/validate`
- `POST /api/auth/reset-password`

Portfolio:

- `GET /api/assets`
- `POST /api/assets`
- `PUT /api/assets/{id}`
- `DELETE /api/assets/{id}`
- `GET /api/portfolio/summary`
- `GET /api/performance/chart`
- `GET /api/snapshots`

Watchlists and dividends:

- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/{id}`
- `GET /api/dividends`
- `POST /api/dividends`
- `PUT /api/dividends/{id}`
- `DELETE /api/dividends/{id}`

Account:

- `GET /api/user/profile`
- `PUT /api/user/profile`

Public market endpoints include `/api/news/**`, `/api/search/**`, `/api/sentiment`, and `/api/contact`.

Protected routes require `Authorization: Bearer <token>`. Assets, watchlist items, and dividends are scoped to the authenticated user.

## Environment Variables

Used by Docker Compose. Local development without Docker uses `application.properties` instead.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MYSQL_DATABASE` | No (default `fintech_portfolio`) | Application database name |
| `MYSQL_USERNAME` | Yes | MySQL application user |
| `MYSQL_PASSWORD` | Yes | MySQL application password |
| `MYSQL_ROOT_PASSWORD` | Yes | MySQL root password |
| `JWT_SECRET` | Yes | Long Base64 secret used to sign JWTs |
| `JWT_EXPIRATION` | No (default `1d`) | Access-token lifetime |
| `CORS_ALLOWED_ORIGINS` | No (default `http://localhost`) | Allowed browser origins |
| `AUTH_RETURN_RESET_TOKEN` | No (default `false`) | Return reset tokens in API responses; local debugging only |
| `ALPHAVANTAGE_API_KEY` | No | Optional market-data key |
| `COINGECKO_API_KEY` | No | Optional crypto-data key |

## Monitoring and Logs

The backend exposes only these unauthenticated Actuator endpoints:

- `GET /actuator/health`
- `GET /actuator/info`

Each request receives an `X-Request-Id` response header. Use it to find the matching request in backend logs. Logs include the HTTP method, path, status code, and duration, but do not log passwords, JWTs, reset tokens, or search values.

Without Docker:

```text
http://localhost:4000/actuator/health
```

With Docker:

```powershell
docker compose logs -f backend
```

## Security Notes

- Keep `.env` and `server-spring/src/main/resources/application.properties` local and untracked.
- Rotate any secret that has ever been committed or shared.
- Use a unique, long Base64 JWT secret for each environment.
- Set `spring.jpa.show-sql=false` and use a managed migration strategy outside local development.
- Do not enable `AUTH_RETURN_RESET_TOKEN` outside local development.
- Keep the database application user separate from the MySQL root user.
- Rate limiting is in-memory per process. Horizontal scaling would need a shared store.

## Verification Commands

```powershell
mvn -f server-spring/pom.xml test
npm --prefix client run build
docker compose --env-file .env.example config --quiet
git diff --check
```

## Contributing

Contributions are welcome. Before opening an issue or pull request, please check the existing project documentation and code and search for related work. For code changes, create a focused branch, describe the user or security problem being solved, and include relevant tests or verification steps.

## Repository Hygiene

Commit these files when changing containerization:

- `docker-compose.yaml`
- `nginx.conf`
- `client/Dockerfile`
- `client/nginx.conf`
- `client/.dockerignore`
- `server-spring/Dockerfile`
- `server-spring/.dockerignore`
- `.env.example`

Do not commit:

- `.env`
- `server-spring/src/main/resources/application.properties`
- `node_modules/`
- `server-spring/target/`
- `client/dist/`
- database volumes, secrets, or API keys

## License

This project is provided for educational and personal portfolio use. It does not execute trades, store brokerage credentials, or give investment advice.

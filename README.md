# BASE - Full Stack Game Project

A full-stack multiplayer game project built with Node.js backend, Vite frontend, and MySQL database.

## Tech Stack

**Backend:**
- Node.js with Express
- Socket.IO for real-time communication
- MySQL database
- JWT authentication with bcrypt
- ES Modules with custom import aliases

**Frontend:**
- Vite build tool and dev server
- D3.js for data visualizations
- Socket.IO client for real-time features

**Infrastructure:**
- Docker & Docker Compose
- MySQL

  
## Prerequisites

**For Docker (Recommended):**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine v20.10+
- Docker Compose V2

**For Local Development:**
- Node.js
- MySQL
- npm

## Installation & Setup

### 1. Clone Repository

```bash
git clone <your-repository>
cd Base
```

### 2. Configure Environment Variables

**Backend Configuration:**

The backend requires renaming the environment template:

```bash
cd back-end
cp .env.develop .env.dev
```

**Important:** The file `.env.develop` MUST be renamed to `.env.dev` for the application to work.

The `.env.dev` file contains:

```env
PORT=3000
DEBUG=true
FRONTEND_URL=http://localhost:5173/
API_URL=http://localhost:3000/
JWT_SECRET=a_super_secret_key
DB_HOST=localhost
DB_DATABASE=cosmonavt
DB_PORT=3307
DB_USER=root
DB_ROOT_PASSWORD=MyDevelopmentPassword
DB_PASSWORD=MyDevelopmentPassword
```

**Frontend Configuration:**

The frontend uses Vite's mode-based configuration. No manual file renaming is required for the frontend.

## Running with Docker

### Start All Services

```bash
# From project root
docker compose up --build

# Or in detached mode
docker compose up -d --build
```

### Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **MySQL Database:** localhost:3307
  - Username: `root` or `appuser`
  - Password: `MyDevelopmentPassword`
  - Database: `cosmonavt`

### Docker Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove data
docker compose down -v

# Rebuild specific service
docker compose up --build server
```

## Running Without Docker

### 1. Setup Database

```bash
mysql -u root -p
CREATE DATABASE cosmonavt;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'MyDevelopmentPassword';
GRANT ALL PRIVILEGES ON cosmonavt.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

```bash
cd back-end

# Install dependencies
npm install

# Configure environment (update DB_HOST=localhost, DB_PORT=3306)
cp .env.develop .env.dev
# Edit .env.dev file to use local MySQL settings

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd front-end

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Points (Local)

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **MySQL Database:** localhost:3306

## Development Scripts

### Backend Scripts

```bash
npm run dev        # Development with nodemon
npm run gendocs    # Generate documentation
npm test           # Run tests
```

### Frontend Scripts

```bash
npm run dev         # Development mode (uses 'developer' mode)
npm run docker-dev  # Docker development mode (uses 'docker_dev' mode with --host)
npm run build       # Production build
npm run preview     # Preview production build
```

## Environment Modes

### Backend

The backend loads different environment files based on `NODE_ENV`:

- `NODE_ENV=docker_dev`: Uses default dotenv config
- Other values: Uses `.env.{NODE_ENV}` file (e.g., `.env.dev`)

### Frontend

The frontend uses Vite modes:

- **Development mode:** `npm run dev` (uses `--mode developer`)
- **Docker development:** `npm run docker-dev` (uses `--mode docker_dev --host`)
- **Production build:** `npm run build`

Vite automatically loads environment files based on the mode:
- `.env.develop || .env.dev` for development mode
- `.env.docker_dev` for Docker development mode

## Project Structure

```
BASE/
├── compose.yml              # Docker Compose configuration
├── back-end/               # Node.js server
│   ├── index.js            # Application entry point
│   ├── .env.develop        # Environment template (rename to .env.dev)
│   ├── core/               # Application modules
│   │   ├── engine/         # Game engine
│   │   ├── sockets/        # Socket.IO handlers
│   │   ├── controllers/    # API controllers
│   │   └── models/         # Database models
│   └── config/             # Configuration files
├── front-end/              # Vite client
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── src/                # Source code
└── db/                     # Database setup
    ├── init.sql            # Database schema
    └── data.sql            # Sample data
```

## Database Connection

The application connects to MySQL using environment variables. Initialization scripts run automatically:

- `db/init.sql` - Database schema
- `db/data.sql` - Sample data

For Docker setup, the database is accessible at `localhost:3307`.
For local setup, use the standard `localhost:3306`.

## Troubleshooting

### Environment File Issues

Ensure `.env.develop` is renamed to `.env.dev` in the backend directory.

### Port Conflicts

```bash
# Find processes using ports
lsof -i :3000
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Database Connection

**Docker:**
```bash
docker compose logs db
docker compose ps
```

**Local:**
```bash
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS
```

### Clear Docker Resources

```bash
docker compose down -v
docker system prune -f
```

## License

[Add your license information]

---

For additional support, create an issue in the repository.

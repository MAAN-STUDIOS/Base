# MySQL Database Setup with Docker

This document provides setup instructions for running our development MySQL database using Docker.

## Prerequisites

- Docker Engine (v20.10+) or Docker Desktop
- Docker Compose V2

> TIP: You can install docker here: https://www.docker.com/products/docker-desktop/

## Quick Start

1. **Navigate to the database directory**:
   ```
   cd back-end/db
   ```

2. **Set up password files** (Optional):

    > INFO: Passwords already set up for local development

   ```
   mkdir -p secrets
   echo "MyDevelopmentPassword" > secrets/root-password.txt
   echo "MyDevelopmentPassword" > secrets/password.txt
   chmod 600 secrets/*.txt
   ```

3. **Start the database**:
   ```
   docker compose up -d
   ```

4. **Connect to the database**:
    - Host: `localhost`
    - Port: `3306`
    - Database: `socketapp` (default)
    - User: `appuser` (default)
    - Password: `MyDevelopmentPassword` (default)

## Environment Variables

You can customize the setup by setting these environment variables before running `docker compose up`:

- `MYSQL_USER`: Database username (default: appuser)
- `MYSQL_DATABASE`: Database name (default: socketapp)
- `COMPOSE_PROJECT_NAME`: Prefix for Docker resources (default: socketapp)
- `TZ`: Timezone (default: UTC)

Example:
```
export MYSQL_DATABASE=myproject
docker compose up -d
```

## Init Script

Place your database initialization SQL commands in the `init.sql` file. This script will run when the container starts with an empty database volume.

## Stopping the Database

```
docker compose down
```

To completely remove all data:
```
docker compose down -v
```

## Troubleshooting

- If you get permission errors, make sure your password files have the correct permissions
- Check container logs: `docker compose logs db`
- Verify the container is running: `docker ps`
- If the healthcheck fails, ensure MySQL is accepting connections: `docker exec -it <container_id> mysql -uappuser -p`
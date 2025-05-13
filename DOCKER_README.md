# ClockingApp Docker Setup

## Overview
This repository has been configured to use Docker for containerized deployment, providing better stability and isolation compared to PM2.

## Prerequisites
- Docker
- Docker Compose
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/clockingApp.git
cd clockingApp
```

### 2. Start the Application
```bash
docker-compose up -d
```

This command will:
- Build the client image
- Build the server image
- Create and start a MySQL database container
- Connect all services together

### 3. Access the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:13000/api

### 4. View Logs
```bash
# View all logs
docker-compose logs

# View logs for a specific service
docker-compose logs client
docker-compose logs server
docker-compose logs db

# Follow logs (real-time)
docker-compose logs -f
```

### 5. Stop the Application
```bash
docker-compose down
```

### 6. Rebuild After Changes
```bash
docker-compose build
docker-compose up -d
```

## Time Zone Configuration

This application is configured to use Vancouver, Canada time zone (PT - Pacific Time) throughout all components:

- **Database**: MySQL is configured with the `-07:00` time zone offset and has `America/Vancouver` set as its time zone.
- **Backend**: The Node.js server uses `moment-timezone` with `America/Vancouver` as the default time zone.
- **Frontend**: The React client uses `date-fns-tz` to handle time zone conversions for display.
- **Docker Containers**: All containers have their system time zone set to `America/Vancouver`.

If you need to change the time zone, you will need to update:

1. The `TZ` environment variables in `docker-compose.yml`
2. The time zone configurations in both Dockerfiles
3. The MySQL command time zone parameter in `docker-compose.yml`
4. The default time zone in `server/src/controllers/clockController.js`
5. The time zone constant in `client/src/utils/dateUtils.js`

## Database Management

### Access MySQL Database
```bash
docker-compose exec db mysql -uroot -pZ2Rh6VGr7DE= clockingapp
```

### Database Backups
```bash
# Create a backup
docker-compose exec db sh -c 'exec mysqldump -uroot -pZ2Rh6VGr7DE= clockingapp' > backup.sql

# Restore from backup
cat backup.sql | docker-compose exec -T db mysql -uroot -pZ2Rh6VGr7DE= clockingapp
```

## Troubleshooting

### Container not starting
Check logs for errors:
```bash
docker-compose logs service_name
```

### Database connection issues
Ensure the database container is running:
```bash
docker-compose ps
```

### Time zone issues
If you're experiencing time zone related issues, verify the system time in each container:
```bash
docker-compose exec client /bin/sh -c "date"
docker-compose exec server /bin/sh -c "date"
docker-compose exec db /bin/sh -c "date"
```

### Restarting individual services
```bash
docker-compose restart service_name
```

## Configuration

The Docker setup uses the environment variables defined in the `docker-compose.yml` file. You can modify these variables as needed for your environment. 
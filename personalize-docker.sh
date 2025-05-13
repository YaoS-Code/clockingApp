#!/bin/bash

# ClockingApp Docker Personalization Script
# This script helps you personalize the Docker configuration for your environment

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   ClockingApp Docker Personalization   ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to get user input with default value
get_input() {
    local prompt="$1"
    local default="$2"
    local input
    
    echo -e -n "${prompt} [${YELLOW}${default}${NC}]: "
    read input
    
    if [ -z "$input" ]; then
        echo "$default"
    else
        echo "$input"
    fi
}

# Function to update docker-compose.yml
update_docker_compose() {
    echo -e "\n${BLUE}Updating docker-compose.yml...${NC}"
    
    # Update container names
    sed -i "s/container_name: clockingapp_client/container_name: ${CONTAINER_PREFIX}_client/g" docker-compose.yml
    sed -i "s/container_name: clockingapp_server/container_name: ${CONTAINER_PREFIX}_server/g" docker-compose.yml
    sed -i "s/container_name: clockingapp_db/container_name: ${CONTAINER_PREFIX}_db/g" docker-compose.yml
    
    # Update ports
    sed -i "s/- \"3001:80\"/- \"${CLIENT_PORT}:80\"/g" docker-compose.yml
    sed -i "s/- \"13000:13000\"/- \"${SERVER_PORT}:${SERVER_PORT}\"/g" docker-compose.yml
    sed -i "s/- \"13306:3306\"/- \"${DB_PORT}:3306\"/g" docker-compose.yml
    
    # Update environment variables
    sed -i "s/- TZ=America\/Vancouver/- TZ=${TIMEZONE//\//\\/}/g" docker-compose.yml
    sed -i "s/- PORT=13000/- PORT=${SERVER_PORT}/g" docker-compose.yml
    sed -i "s/- DB_PASSWORD=Z2Rh6VGr7DE=/- DB_PASSWORD=${DB_PASSWORD}/g" docker-compose.yml
    sed -i "s/- MYSQL_ROOT_PASSWORD=Z2Rh6VGr7DE=/- MYSQL_ROOT_PASSWORD=${DB_PASSWORD}/g" docker-compose.yml
    sed -i "s/- MYSQL_DATABASE=clockingapp/- MYSQL_DATABASE=${DB_NAME}/g" docker-compose.yml
    sed -i "s/- DB_NAME=clockingapp/- DB_NAME=${DB_NAME}/g" docker-compose.yml
    sed -i "s/- JWT_SECRET=J8KwPz5X2FbArE7VcN9QmT6LsDh3YuG4/- JWT_SECRET=${JWT_SECRET}/g" docker-compose.yml
    sed -i "s/- CORS_ORIGIN=http:\/\/clock.mmcwellness.ca/- CORS_ORIGIN=${CORS_ORIGIN//\//\\/}/g" docker-compose.yml
    
    # Update email settings if provided
    if [ ! -z "$SMTP_USER" ]; then
        sed -i "s/- SMTP_USER=specialist@mmcwellness.ca/- SMTP_USER=${SMTP_USER}/g" docker-compose.yml
        sed -i "s/- SMTP_FROM=specialist@mmcwellness.ca/- SMTP_FROM=${SMTP_USER}/g" docker-compose.yml
    fi
    
    if [ ! -z "$SMTP_PASSWORD" ]; then
        sed -i "s/- SMTP_PASSWORD=gucz jkeu ysxk lqwg/- SMTP_PASSWORD=${SMTP_PASSWORD}/g" docker-compose.yml
    fi
    
    if [ ! -z "$SMTP_CC" ]; then
        sed -i "s/- SMTP_CC=info@mmcwellness.ca/- SMTP_CC=${SMTP_CC}/g" docker-compose.yml
    fi
    
    # Update database healthcheck
    sed -i "s/mysqladmin\", \"ping\", \"-h\", \"localhost\", \"-u\", \"root\", \"-pZ2Rh6VGr7DE=/mysqladmin\", \"ping\", \"-h\", \"localhost\", \"-u\", \"root\", \"-p${DB_PASSWORD}/g" docker-compose.yml
    
    echo -e "${GREEN}✓ docker-compose.yml updated${NC}"
}

# Function to update Dockerfiles
update_dockerfiles() {
    echo -e "\n${BLUE}Updating Dockerfiles...${NC}"
    
    # Update Dockerfile.client
    sed -i "s/ENV TZ=America\/Vancouver/ENV TZ=${TIMEZONE//\//\\/}/g" Dockerfile.client
    sed -i "s|cp /usr/share/zoneinfo/America/Vancouver /etc/localtime|cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime|g" Dockerfile.client
    sed -i "s|echo \"America/Vancouver\" > /etc/timezone|echo \"${TIMEZONE}\" > /etc/timezone|g" Dockerfile.client
    
    # Update Dockerfile.server
    sed -i "s/ENV TZ=America\/Vancouver/ENV TZ=${TIMEZONE//\//\\/}/g" Dockerfile.server
    sed -i "s|cp /usr/share/zoneinfo/America/Vancouver /etc/localtime|cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime|g" Dockerfile.server
    sed -i "s|echo \"America/Vancouver\" > /etc/timezone|echo \"${TIMEZONE}\" > /etc/timezone|g" Dockerfile.server
    
    echo -e "${GREEN}✓ Dockerfiles updated${NC}"
}

# Function to update scripts
update_scripts() {
    echo -e "\n${BLUE}Updating scripts...${NC}"
    
    # Update clockingapp-docker.sh
    if [ -f "clockingapp-docker.sh" ]; then
        cp clockingapp-docker.sh "${CONTAINER_PREFIX}-docker.sh"
        sed -i "s/ClockingApp Docker Management Script/${CONTAINER_PREFIX} Docker Management Script/g" "${CONTAINER_PREFIX}-docker.sh"
        sed -i "s/Usage: \.\/clockingapp-docker.sh/Usage: \.\/${CONTAINER_PREFIX}-docker.sh/g" "${CONTAINER_PREFIX}-docker.sh"
        sed -i "s/Starting ClockingApp containers/Starting ${CONTAINER_PREFIX} containers/g" "${CONTAINER_PREFIX}-docker.sh"
        sed -i "s/Stopping ClockingApp containers/Stopping ${CONTAINER_PREFIX} containers/g" "${CONTAINER_PREFIX}-docker.sh"
        sed -i "s/Restarting ClockingApp containers/Restarting ${CONTAINER_PREFIX} containers/g" "${CONTAINER_PREFIX}-docker.sh"
        sed -i "s/BACKUP_FILE=\"clockingapp_backup/BACKUP_FILE=\"${DB_NAME}_backup/g" "${CONTAINER_PREFIX}-docker.sh"
        sed -i "s/mysqldump -uroot -pZ2Rh6VGr7DE= clockingapp/mysqldump -uroot -p${DB_PASSWORD} ${DB_NAME}/g" "${CONTAINER_PREFIX}-docker.sh"
        chmod +x "${CONTAINER_PREFIX}-docker.sh"
        echo -e "${GREEN}✓ Created ${CONTAINER_PREFIX}-docker.sh${NC}"
    fi
    
    # Update timezone-config.sh
    if [ -f "timezone-config.sh" ]; then
        sed -i "s/ClockingApp Time Zone Configuration/${CONTAINER_PREFIX} Time Zone Configuration/g" timezone-config.sh
        sed -i "s/clockingapp_client/${CONTAINER_PREFIX}_client/g" timezone-config.sh
        sed -i "s/clockingapp_server/${CONTAINER_PREFIX}_server/g" timezone-config.sh
        sed -i "s/clockingapp_db/${CONTAINER_PREFIX}_db/g" timezone-config.sh
        sed -i "s/mysql -uroot -pZ2Rh6VGr7DE=/mysql -uroot -p${DB_PASSWORD}/g" timezone-config.sh
        sed -i "s/\.\/clockingapp-docker.sh rebuild/\.\/${CONTAINER_PREFIX}-docker.sh rebuild/g" timezone-config.sh
        echo -e "${GREEN}✓ Updated timezone-config.sh${NC}"
    fi
    
    # Update import-database.sh
    if [ -f "import-database.sh" ]; then
        sed -i "s/SOURCE_PASSWORD=\"Z2Rh6VGr7DE=\"/SOURCE_PASSWORD=\"${DB_PASSWORD}\"/g" import-database.sh
        sed -i "s/SOURCE_DB=\"clockingapp\"/SOURCE_DB=\"${DB_NAME}\"/g" import-database.sh
        sed -i "s/DOCKER_CONTAINER=\"clockingapp_db_1\"/DOCKER_CONTAINER=\"${CONTAINER_PREFIX}_db\"/g" import-database.sh
        sed -i "s/DOCKER_PASSWORD=\"Z2Rh6VGr7DE=\"/DOCKER_PASSWORD=\"${DB_PASSWORD}\"/g" import-database.sh
        sed -i "s/DOCKER_DB=\"clockingapp\"/DOCKER_DB=\"${DB_NAME}\"/g" import-database.sh
        sed -i "s/BACKUP_FILE=\"clockingapp_data/BACKUP_FILE=\"${DB_NAME}_data/g" import-database.sh
        echo -e "${GREEN}✓ Updated import-database.sh${NC}"
    fi
    
    echo -e "${GREEN}✓ Scripts updated${NC}"
}

# Function to update server code
update_server_code() {
    echo -e "\n${BLUE}Updating server code...${NC}"
    
    # Update clockController.js
    if [ -f "server/src/controllers/clockController.js" ]; then
        sed -i "s|moment.tz.setDefault('America/Vancouver')|moment.tz.setDefault('${TIMEZONE}')|g" server/src/controllers/clockController.js
        sed -i "s|moment.tz(record.clock_in, 'America/Vancouver')|moment.tz(record.clock_in, '${TIMEZONE}')|g" server/src/controllers/clockController.js
        sed -i "s|moment.tz(record.clock_out, 'America/Vancouver')|moment.tz(record.clock_out, '${TIMEZONE}')|g" server/src/controllers/clockController.js
        sed -i "s|moment.tz(start_date, 'America/Vancouver')|moment.tz(start_date, '${TIMEZONE}')|g" server/src/controllers/clockController.js
        sed -i "s|moment.tz(end_date, 'America/Vancouver')|moment.tz(end_date, '${TIMEZONE}')|g" server/src/controllers/clockController.js
        echo -e "${GREEN}✓ Updated server/src/controllers/clockController.js${NC}"
    fi
    
    # Update dateUtils.js
    if [ -f "client/src/utils/dateUtils.js" ]; then
        sed -i "s|const VANCOUVER_TIMEZONE = 'America/Vancouver'|const VANCOUVER_TIMEZONE = '${TIMEZONE}'|g" client/src/utils/dateUtils.js
        echo -e "${GREEN}✓ Updated client/src/utils/dateUtils.js${NC}"
    fi
    
    # Update api.js
    if [ -f "client/src/services/api.js" ]; then
        sed -i "s|window.location.hostname === 'clock.mmcwellness.ca'|window.location.hostname === '${DOMAIN}'|g" client/src/services/api.js
        sed -i "s|baseURL = 'https://clock.mmcwellness.ca/api'|baseURL = '${CORS_ORIGIN}/api'|g" client/src/services/api.js
        echo -e "${GREEN}✓ Updated client/src/services/api.js${NC}"
    fi
    
    echo -e "${GREEN}✓ Server code updated${NC}"
}

# Function to update MySQL init scripts
update_mysql_init() {
    echo -e "\n${BLUE}Updating MySQL init scripts...${NC}"
    
    # Update timezone.sql
    if [ -f "mysql-init/timezone.sql" ]; then
        # Get timezone offset
        TZ_OFFSET=$(TZ=${TIMEZONE} date +%z | sed 's/\([+-]\)\([0-9][0-9]\)\([0-9][0-9]\)/\1\2:\3/')
        sed -i "s|SET GLOBAL time_zone = '-07:00'|SET GLOBAL time_zone = '${TZ_OFFSET}'|g" mysql-init/timezone.sql
        sed -i "s|SET time_zone = '-07:00'|SET time_zone = '${TZ_OFFSET}'|g" mysql-init/timezone.sql
        sed -i "s|-- SET GLOBAL time_zone = 'America/Vancouver'|-- SET GLOBAL time_zone = '${TIMEZONE}'|g" mysql-init/timezone.sql
        sed -i "s|-- SET time_zone = 'America/Vancouver'|-- SET time_zone = '${TIMEZONE}'|g" mysql-init/timezone.sql
        echo -e "${GREEN}✓ Updated mysql-init/timezone.sql${NC}"
    fi
    
    # Update import-backup.sql
    if [ -f "mysql-init/import-backup.sql" ]; then
        sed -i "s|SOURCE /docker-entrypoint-initdb.d/clockingapp_backup.sql|SOURCE /docker-entrypoint-initdb.d/${DB_NAME}_backup.sql|g" mysql-init/import-backup.sql
        echo -e "${GREEN}✓ Updated mysql-init/import-backup.sql${NC}"
    fi
    
    echo -e "${GREEN}✓ MySQL init scripts updated${NC}"
}

# Get personalization inputs
echo -e "${BLUE}Please provide the following information (press Enter to use default values):${NC}"
echo ""

# Container prefix
CONTAINER_PREFIX=$(get_input "Container prefix" "clockingapp")

# Ports
CLIENT_PORT=$(get_input "Frontend port" "3001")
SERVER_PORT=$(get_input "Backend API port" "13000")
DB_PORT=$(get_input "Database port" "13306")

# Database settings
DB_NAME=$(get_input "Database name" "clockingapp")
DB_PASSWORD=$(get_input "Database password" "Z2Rh6VGr7DE=")

# Time zone
TIMEZONE=$(get_input "Time zone" "America/Vancouver")

# JWT Secret
JWT_SECRET=$(get_input "JWT Secret" "J8KwPz5X2FbArE7VcN9QmT6LsDh3YuG4")

# Domain and CORS
DOMAIN=$(get_input "Domain name (without http/https)" "clock.mmcwellness.ca")
CORS_ORIGIN=$(get_input "CORS Origin URL" "https://clock.mmcwellness.ca")

# Email settings (optional)
echo -e "\n${BLUE}Email settings (optional, press Enter to skip):${NC}"
SMTP_USER=$(get_input "SMTP User" "")
SMTP_PASSWORD=$(get_input "SMTP Password" "")
SMTP_CC=$(get_input "SMTP CC" "")

# Confirm settings
echo -e "\n${BLUE}Please confirm your settings:${NC}"
echo -e "Container prefix: ${YELLOW}${CONTAINER_PREFIX}${NC}"
echo -e "Frontend port: ${YELLOW}${CLIENT_PORT}${NC}"
echo -e "Backend API port: ${YELLOW}${SERVER_PORT}${NC}"
echo -e "Database port: ${YELLOW}${DB_PORT}${NC}"
echo -e "Database name: ${YELLOW}${DB_NAME}${NC}"
echo -e "Database password: ${YELLOW}${DB_PASSWORD}${NC}"
echo -e "Time zone: ${YELLOW}${TIMEZONE}${NC}"
echo -e "JWT Secret: ${YELLOW}${JWT_SECRET}${NC}"
echo -e "Domain: ${YELLOW}${DOMAIN}${NC}"
echo -e "CORS Origin: ${YELLOW}${CORS_ORIGIN}${NC}"
if [ ! -z "$SMTP_USER" ]; then
    echo -e "SMTP User: ${YELLOW}${SMTP_USER}${NC}"
    echo -e "SMTP Password: ${YELLOW}${SMTP_PASSWORD}${NC}"
    echo -e "SMTP CC: ${YELLOW}${SMTP_CC}${NC}"
fi

echo ""
read -p "Do you want to proceed with these settings? (y/n): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo -e "${RED}Personalization cancelled.${NC}"
    exit 1
fi

# Make backup of original files
echo -e "\n${BLUE}Creating backups of original files...${NC}"
cp docker-compose.yml docker-compose.yml.bak
cp Dockerfile.client Dockerfile.client.bak
cp Dockerfile.server Dockerfile.server.bak
echo -e "${GREEN}✓ Backups created${NC}"

# Update files
update_docker_compose
update_dockerfiles
update_scripts
update_server_code
update_mysql_init

echo -e "\n${GREEN}Personalization completed successfully!${NC}"
echo -e "You can now start your containers with: ${YELLOW}./${CONTAINER_PREFIX}-docker.sh start${NC}"
echo ""
echo -e "${BLUE}Note:${NC} If you need to revert changes, backup files with .bak extension are available."
echo -e "${BLUE}=========================================${NC}"

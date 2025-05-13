#!/bin/bash

# ClockingApp Docker Management Script

function show_help {
    echo "ClockingApp Docker Management Script"
    echo "Usage: ./clockingapp-docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start         Start all containers"
    echo "  stop          Stop all containers"
    echo "  restart       Restart all containers"
    echo "  logs          Show logs for all containers"
    echo "  status        Show container status"
    echo "  rebuild       Rebuild and restart containers"
    echo "  backup        Backup the database"
    echo "  restore       Restore database from backup file"
    echo "  help          Show this help message"
    echo ""
}

function start_containers {
    echo "Starting ClockingApp containers..."
    docker-compose up -d
    echo "Done."
}

function stop_containers {
    echo "Stopping ClockingApp containers..."
    docker-compose down
    echo "Done."
}

function restart_containers {
    echo "Restarting ClockingApp containers..."
    docker-compose restart
    echo "Done."
}

function show_logs {
    echo "Showing logs (press Ctrl+C to exit)..."
    docker-compose logs -f
}

function show_status {
    echo "Container status:"
    docker-compose ps
}

function rebuild_containers {
    echo "Rebuilding and restarting containers..."
    docker-compose down
    docker-compose build
    docker-compose up -d
    echo "Done."
}

function backup_database {
    echo "Creating database backup..."
    BACKUP_FILE="clockingapp_backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec db sh -c 'exec mysqldump -uroot -pZ2Rh6VGr7DE= clockingapp' > $BACKUP_FILE
    if [ $? -eq 0 ]; then
        echo "✓ Database backup created: $BACKUP_FILE"
    else
        echo "✗ Error creating database backup"
    fi
}

function restore_database {
    if [ -z "$1" ]; then
        echo "Error: Backup file not specified"
        echo "Usage: $0 restore <backup_file.sql>"
        exit 1
    fi

    BACKUP_FILE="$1"

    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: Backup file '$BACKUP_FILE' not found"
        exit 1
    fi

    echo "Restoring database from $BACKUP_FILE..."
    cat $BACKUP_FILE | docker-compose exec -T db mysql -uroot -pZ2Rh6VGr7DE= clockingapp

    if [ $? -eq 0 ]; then
        echo "✓ Database restored successfully"
    else
        echo "✗ Error restoring database"
    fi
}

# Main script
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

case "$1" in
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    rebuild)
        rebuild_containers
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    help)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

#!/bin/sh
echo "🚀 Iniciando servidor Uvicorn en Railway..."
exec uvicorn main:app --host 0.0.0.0 --port 8080


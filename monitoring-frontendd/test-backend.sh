#!/bin/bash

echo "🔍 TEST DES APIS BACKEND"
echo "========================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_URL="http://localhost:8080"

echo "📊 Test 1: Overview Metrics"
echo "GET $BACKEND_URL/api/metrics/overview?timeRange=1h"
echo ""
response=$(curl -s "$BACKEND_URL/api/metrics/overview?timeRange=1h")
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""
echo "---"
echo ""

echo "📋 Test 2: Logs Search"
echo "GET $BACKEND_URL/api/logs/search?limit=5"
echo ""
response=$(curl -s "$BACKEND_URL/api/logs/search?limit=5")
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""
echo "---"
echo ""

echo "❌ Test 3: Error Logs"
echo "GET $BACKEND_URL/api/logs/errors?limit=5"
echo ""
response=$(curl -s "$BACKEND_URL/api/logs/errors?limit=5")
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""
echo "---"
echo ""

echo "🔧 Test 4: Pi-Gateway Details"
echo "GET $BACKEND_URL/api/metrics/connector/pi-gateway?timeRange=24h"
echo ""
response=$(curl -s "$BACKEND_URL/api/metrics/connector/pi-gateway?timeRange=24h")
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""
echo "---"
echo ""

echo "✅ Tests terminés !"
echo ""
echo "🔍 VÉRIFICATIONS À FAIRE :"
echo "1. Est-ce que totalMetrics contient des valeurs (pas null) ?"
echo "2. Est-ce que connectorMetrics est un tableau avec des éléments ?"
echo "3. Est-ce que timeline contient des points de données ?"
echo "4. Est-ce que logs contient des entrées de log ?"
echo ""
echo "Si tout est null, le problème vient du MetricsService.java qui ne calcule pas les métriques."

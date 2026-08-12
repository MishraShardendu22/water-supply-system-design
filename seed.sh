#!/bin/bash
set -e

API="http://localhost:8080"

echo "=== 1. FETCHING FRESH AUTH TOKEN ==="
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"mail":"admin@water.gov","password":"AdminPassword123!"}' "$API/auth/login" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: Failed to obtain auth token."
  exit 1
fi

echo "Auth Token obtained successfully."

echo "=== 2. CREATING REQUESTERS (PERSONS) ==="
P1_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Rajesh Kumar",
  "contactNumber": "+919811223344",
  "address": "House 42, Ambedkar Nagar Sector 4"
}' "$API/persons" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

P2_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Dr. Sunita Sharma",
  "contactNumber": "+919876543210",
  "address": "St. Marys Hospital Ward 9"
}' "$API/persons" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

P3_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Vikram Singh",
  "contactNumber": "+919123456789",
  "address": "Block C, Rajiv Gandhi Colony"
}' "$API/persons" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

echo "Persons created: $P1_ID, $P2_ID, $P3_ID"

echo "=== 3. CREATING DROP-OFF LOCATIONS ==="
LOC1_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "address": "Ambedkar Nagar Sector 4, Cluster 12",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "landmark": "Near Blue Overhead Water Tank",
  "hasPrivateBorewell": false,
  "trafficRisk": "High",
  "normalTravelTime": 25,
  "isSchoolOrHospital": false
}' "$API/drop-off-locations" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

LOC2_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "address": "St. Marys Hospital Ward 9",
  "latitude": 28.6250,
  "longitude": 77.2150,
  "landmark": "Opposite Main Emergency Gate",
  "hasPrivateBorewell": false,
  "trafficRisk": "Medium",
  "normalTravelTime": 15,
  "isSchoolOrHospital": true
}' "$API/drop-off-locations" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

LOC3_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "address": "Rajiv Gandhi Colony Housing Block C",
  "latitude": 28.6010,
  "longitude": 77.1950,
  "landmark": "Behind Community Center Park",
  "hasPrivateBorewell": true,
  "trafficRisk": "Low",
  "normalTravelTime": 20,
  "isSchoolOrHospital": false
}' "$API/drop-off-locations" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

echo "Locations created: $LOC1_ID, $LOC2_ID, $LOC3_ID"

echo "=== 4. REGISTERING TANKER DRIVERS ==="
D1_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Ramesh Chand",
  "contactNumber": "+919800011111",
  "phoneType": "Basic"
}' "$API/drivers" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

D2_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Suresh Yadav",
  "contactNumber": "+919800022222",
  "phoneType": "Smart"
}' "$API/drivers" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

D3_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Mahendra Singh",
  "contactNumber": "+919800033333",
  "phoneType": "Basic"
}' "$API/drivers" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

echo "Drivers created: $D1_ID, $D2_ID, $D3_ID"

echo "=== 5. REGISTERING FLEET VEHICLES ==="
V1_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "type": "Municipal",
  "capacity": 10000
}' "$API/vehicles" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

V2_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "type": "Municipal",
  "capacity": 12000
}' "$API/vehicles" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

V3_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "type": "Contracted",
  "capacity": 15000
}' "$API/vehicles" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

echo "Vehicles created: $V1_ID, $V2_ID, $V3_ID"

echo "=== 6. REGISTERING FILLING STATIONS ==="
ST1_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Central Hydrant Refill Station 1",
  "locationId": "'$LOC1_ID'"
}' "$API/filling-stations" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

ST2_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Northern Reservoir Station 2",
  "locationId": "'$LOC2_ID'"
}' "$API/filling-stations" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

echo "Filling Stations created: $ST1_ID, $ST2_ID"

echo "=== 7. CREATING WATER SUPPLY REQUESTS ==="
REQ1_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "requestType": "Online",
  "requesterId": "'$P1_ID'",
  "dropOffLocationId": "'$LOC1_ID'"
}' "$API/requests" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

REQ2_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "requestType": "Call",
  "requesterId": "'$P2_ID'",
  "dropOffLocationId": "'$LOC2_ID'"
}' "$API/requests" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

REQ3_ID=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "requestType": "Letter",
  "requesterId": "'$P3_ID'",
  "dropOffLocationId": "'$LOC3_ID'"
}' "$API/requests" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

echo "Requests created: $REQ1_ID, $REQ2_ID, $REQ3_ID"

echo "=== 8. CALCULATING PRIORITY SCORES ==="
curl -s -X POST -H "Authorization: Bearer $TOKEN" "$API/requests/$REQ1_ID/calculate-priority" > /dev/null
curl -s -X POST -H "Authorization: Bearer $TOKEN" "$API/requests/$REQ2_ID/calculate-priority" > /dev/null
curl -s -X POST -H "Authorization: Bearer $TOKEN" "$API/requests/$REQ3_ID/calculate-priority" > /dev/null

echo "=== 9. ASSIGNING & DISPATCHING HOSPITAL EMERGENCY TANKER ==="
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "driverId": "'$D1_ID'",
  "vehicleId": "'$V1_ID'",
  "fillingStationId": "'$ST2_ID'"
}' "$API/requests/$REQ2_ID/assign" > /dev/null

curl -s -X POST -H "Authorization: Bearer $TOKEN" "$API/requests/$REQ2_ID/dispatch" > /dev/null

echo "=== 10. CREATING DISTRICT MANAGER ==="
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
  "name": "Representative Manoj Gupta",
  "contactNumber": "+919711223344",
  "normalPersonId": "'$P1_ID'",
  "locationId": "'$LOC1_ID'"
}' "$API/district-managers" > /dev/null

echo "=== DATABASE SEEDING COMPLETED SUCCESSFULLY ==="

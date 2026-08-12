#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse
import sys

API_URL = "http://localhost:8080"

def post(url, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(f"{API_URL}{url}", data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_text = e.read().decode("utf-8")
        print(f"HTTP {e.code} for {url}: {err_text}", file=sys.stderr)
        try:
            return json.loads(err_text)
        except:
            return None
    except Exception as e:
        print(f"Error calling {url}: {e}", file=sys.stderr)
        return None

def get_id(res):
    if res and res.get("success") and res.get("data"):
        return res["data"].get("id")
    return None

def main():
    print("=== 1. AUTHENTICATING ADMIN ===")
    login_res = post("/auth/login", {"mail": "admin@water.gov", "password": "AdminPassword123!"})
    if not login_res or not login_res.get("success"):
        print("Failed to authenticate admin!", file=sys.stderr)
        sys.exit(1)
    
    token = login_res["data"]["token"]
    print("Admin Auth Token acquired successfully.")

    print("=== 2. CREATING REQUESTERS (PERSONS) ===")
    p1 = get_id(post("/persons", {"name": "Rajesh Kumar", "contactNumber": "+919811223344", "address": "House 42, Ambedkar Nagar Sector 4"}, token))
    p2 = get_id(post("/persons", {"name": "Dr. Sunita Sharma", "contactNumber": "+919876543210", "address": "St. Marys Hospital Ward 9"}, token))
    p3 = get_id(post("/persons", {"name": "Vikram Singh", "contactNumber": "+919123456789", "address": "Block C, Rajiv Gandhi Colony"}, token))
    print(f"Persons created: {p1}, {p2}, {p3}")

    print("=== 3. CREATING DROP-OFF LOCATIONS ===")
    loc1 = get_id(post("/drop-off-locations", {
        "address": "Ambedkar Nagar Sector 4, Cluster 12",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "landmark": "Near Blue Overhead Water Tank",
        "hasPrivateBorewell": False,
        "trafficRisk": "High",
        "normalTravelTime": 25,
        "isSchoolOrHospital": False
    }, token))

    loc2 = get_id(post("/drop-off-locations", {
        "address": "St. Marys Hospital Ward 9",
        "latitude": 28.6250,
        "longitude": 77.2150,
        "landmark": "Opposite Main Emergency Gate",
        "hasPrivateBorewell": False,
        "trafficRisk": "Medium",
        "normalTravelTime": 15,
        "isSchoolOrHospital": True
    }, token))

    loc3 = get_id(post("/drop-off-locations", {
        "address": "Rajiv Gandhi Colony Housing Block C",
        "latitude": 28.6010,
        "longitude": 77.1950,
        "landmark": "Behind Community Center Park",
        "hasPrivateBorewell": True,
        "trafficRisk": "Low",
        "normalTravelTime": 20,
        "isSchoolOrHospital": False
    }, token))
    print(f"Locations created: {loc1}, {loc2}, {loc3}")

    print("=== 4. REGISTERING TANKER DRIVERS ===")
    d1 = get_id(post("/drivers", {"name": "Ramesh Chand", "contactNumber": "+919800011111", "phoneType": "Basic"}, token))
    d2 = get_id(post("/drivers", {"name": "Suresh Yadav", "contactNumber": "+919800022222", "phoneType": "Smart"}, token))
    d3 = get_id(post("/drivers", {"name": "Mahendra Singh", "contactNumber": "+919800033333", "phoneType": "Basic"}, token))
    print(f"Drivers created: {d1}, {d2}, {d3}")

    print("=== 5. REGISTERING FLEET VEHICLES ===")
    v1 = get_id(post("/vehicles", {"type": "Municipal", "capacity": 10000}, token))
    v2 = get_id(post("/vehicles", {"type": "Municipal", "capacity": 12000}, token))
    v3 = get_id(post("/vehicles", {"type": "Contracted", "capacity": 15000}, token))
    print(f"Vehicles created: {v1}, {v2}, {v3}")

    print("=== 6. REGISTERING FILLING STATIONS ===")
    st1 = get_id(post("/filling-stations", {"name": "Central Hydrant Refill Station 1", "locationId": loc1}, token))
    st2 = get_id(post("/filling-stations", {"name": "Northern Reservoir Station 2", "locationId": loc2}, token))
    print(f"Filling Stations created: {st1}, {st2}")

    print("=== 7. CREATING WATER SUPPLY REQUESTS ===")
    req1 = get_id(post("/requests", {"requestType": "Online", "requesterId": p1, "dropOffLocationId": loc1}, token))
    req2 = get_id(post("/requests", {"requestType": "Call", "requesterId": p2, "dropOffLocationId": loc2}, token))
    req3 = get_id(post("/requests", {"requestType": "Letter", "requesterId": p3, "dropOffLocationId": loc3}, token))
    print(f"Requests created: {req1}, {req2}, {req3}")

    print("=== 8. CALCULATING PRIORITY SCORES ===")
    post(f"/requests/{req1}/calculate-priority", None, token)
    post(f"/requests/{req2}/calculate-priority", None, token)
    post(f"/requests/{req3}/calculate-priority", None, token)
    print("Priority scores calculated.")

    print("=== 9. ASSIGNING & DISPATCHING HOSPITAL EMERGENCY TANKER ===")
    post(f"/requests/{req2}/assign", {"driverId": d1, "vehicleId": v1, "fillingStationId": st2}, token)
    post(f"/requests/{req2}/dispatch", None, token)
    print(f"Emergency request {req2} assigned to Driver Ramesh Chand and DISPATCHED!")

    print("=== 10. GENERATING OTP FOR EMERGENCY DISPATCH ===")
    otp_res = post(f"/requests/{req2}/generate-otp", None, token)
    if otp_res and otp_res.get("success"):
        otp_code = otp_res["data"]["otp"]
        print(f"==========================================")
        print(f"DISPATCHED RESIDENT OTP CODE: {otp_code}")
        print(f"==========================================")

    print("=== 11. CREATING DISTRICT MANAGER ===")
    post("/district-managers", {
        "name": "Representative Manoj Gupta",
        "contactNumber": "+919711223344",
        "normalPersonId": p1,
        "locationId": loc1
    }, token)

    print("\nDATABASE SEEDING & DISPATCH SETUP COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()

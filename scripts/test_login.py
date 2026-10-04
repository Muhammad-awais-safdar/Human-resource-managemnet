import urllib.request
import json

# Test login API payload simulation directly to verify authentication API contract
url = "http://localhost:3000/api/v1/auth/login"
payload = {
    "email": "ceo@ep-systems.com",
    "password": "password123",
    "subdomain": "awais"
}

headers = {
    "Content-Type": "application/json",
    "X-Tenant-Subdomain": "awais",
    "Host": "awais.localhost:3000"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        status_code = response.getcode()
        body = response.read().decode('utf-8')
        print(f"HTTP Status: {status_code}")
        print("Response Body:", body[:500])
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print("Error Body:", e.read().decode('utf-8')[:500])
except Exception as e:
    print("Connection Exception:", str(e))

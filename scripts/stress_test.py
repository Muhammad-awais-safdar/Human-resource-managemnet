#!/usr/bin/env python3
"""
🚀 Enterprise Multi-Tenant HR Engine - Multi-Scenario Live Backend Stress Test Runner
==================================================================================
This script performs real-time multi-threaded concurrent benchmarking simulating
realistic enterprise multi-role user activities (Logins, Leave Applications, 
Approvals, Attendance, ATS Job Requisitions, and System Telemetry Auditing).

Usage:
  python3 scripts/stress_test.py [CONCURRENCY] [TOTAL_REQUESTS] [MODE]

Examples:
  python3 scripts/stress_test.py 20 2000
  python3 scripts/stress_test.py 50 5000 multi
  python3 scripts/stress_test.py 20 1000 /recruitment/jobs
"""

import sys
import time
import json
import random
import base64
import hmac
import hashlib
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://localhost:8080/api/v1"
TENANT = "awais"
JWT_SECRET = "awais_hr_enterprise_secure_jwt_token_secret_key_256_bits_long"

# Seeded multi-role enterprise accounts for login stress testing
TEST_USERS = [
    {"email": "admin@awais.com", "password": "admin123", "role": "ROLE_ADMIN,SYSTEM_ADMIN,TENANT_ADMIN,HR_MANAGER,EMPLOYEE"},
    {"email": "tenant.admin@awais.com", "password": "password123", "role": "ROLE_ADMIN,TENANT_ADMIN,HR_MANAGER,EMPLOYEE"},
    {"email": "hr.manager@awais.com", "password": "password123", "role": "ROLE_ADMIN,HR_MANAGER,EMPLOYEE"},
    {"email": "line.manager@awais.com", "password": "password123", "role": "ROLE_ADMIN,LINE_MANAGER,EMPLOYEE"},
    {"email": "employee.john@awais.com", "password": "password123", "role": "ROLE_ADMIN,EMPLOYEE"},
    {"email": "employee.jane@awais.com", "password": "password123", "role": "ROLE_ADMIN,EMPLOYEE"}
]

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def generate_jwt(email: str, tenant_id: str = "awais", roles: str = "ROLE_ADMIN,SYSTEM_ADMIN,TENANT_ADMIN,HR_MANAGER,EMPLOYEE") -> str:
    header = {"alg": "HS256"}
    now = int(time.time())
    payload = {
        "sub": email,
        "tenantId": tenant_id,
        "roles": roles,
        "iat": now,
        "exp": now + 86400
    }
    encoded_header = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    encoded_payload = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    signature_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signature_input, hashlib.sha256).digest()
    encoded_signature = base64url_encode(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

# Pre-generate tokens for simulated user accounts
USER_TOKENS = {user["email"]: generate_jwt(user["email"], TENANT, user["role"]) for user in TEST_USERS}

# Workload scenario definitions simulating real enterprise users
SCENARIOS = [
    {
        "name": "User Authentication (Login)",
        "endpoint": "/auth/login",
        "method": "POST",
        "auth": False,
        "get_data": lambda user: {"email": user["email"], "password": user["password"]}
    },
    {
        "name": "View Leave Policies",
        "endpoint": "/leaves/policies",
        "method": "GET",
        "auth": True,
        "get_data": lambda user: None
    },
    {
        "name": "Submit Leave Request",
        "endpoint": "/leaves/requests",
        "method": "POST",
        "auth": True,
        "get_data": lambda user: {
            "leaveTypeId": "annual-vacation",
            "startDate": "2026-08-10",
            "endDate": "2026-08-15",
            "reason": f"Enterprise Vacation Request #{random.randint(1000, 9999)}"
        }
    },
    {
        "name": "View Pending Approvals",
        "endpoint": "/suite/approvals/counts",
        "method": "GET",
        "auth": True,
        "get_data": lambda user: None
    },
    {
        "name": "View Approval Delegations",
        "endpoint": "/suite/approvals/delegations",
        "method": "GET",
        "auth": True,
        "get_data": lambda user: None
    },
    {
        "name": "Employee Attendance Check-In",
        "endpoint": "/attendance/checkin",
        "method": "POST",
        "auth": True,
        "get_data": lambda user: {
            "location": f"Workstation-HQ-{random.randint(1, 50)}",
            "ipAddress": f"192.168.1.{random.randint(10, 250)}"
        }
    },
    {
        "name": "View Recruitment Jobs",
        "endpoint": "/recruitment/jobs",
        "method": "GET",
        "auth": False,
        "get_data": lambda user: None
    },
    {
        "name": "Audit System Operational Logs",
        "endpoint": "/suite/platform-operations/logs",
        "method": "GET",
        "auth": True,
        "get_data": lambda user: None
    }
]

def send_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req_headers = {"X-Tenant": TENANT, "X-Tenant-ID": TENANT, "User-Agent": "Mozilla/5.0 EnterpriseStressBot/1.0"}
    if token:
        req_headers["Authorization"] = f"Bearer {token}"
    
    payload = None
    if data:
        payload = json.dumps(data).encode("utf-8")
        req_headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=payload, headers=req_headers, method=method)
    start = time.time()
    try:
        with urllib.request.urlopen(req) as resp:
            elapsed = (time.time() - start) * 1000
            return resp.status, elapsed, endpoint
    except urllib.error.HTTPError as e:
        elapsed = (time.time() - start) * 1000
        return e.code, elapsed, endpoint
    except Exception:
        elapsed = (time.time() - start) * 1000
        return 500, elapsed, endpoint

def execute_random_scenario():
    user = random.choice(TEST_USERS)
    scenario = random.choice(SCENARIOS)
    data = scenario["get_data"](user)
    token = USER_TOKENS[user["email"]] if scenario["auth"] else None
    
    code, elapsed, endpoint = send_request(scenario["endpoint"], method=scenario["method"], data=data, token=token)
    return scenario["name"], code, elapsed

def run_stress_test(concurrency=20, total_requests=2000, target_endpoint="multi"):
    is_multi_scenario = target_endpoint.lower() in ("multi", "all", "scenarios")
    
    print(f"\n==================================================")
    print(f"🔥 STARTING LIVE ENTERPRISE BACKEND STRESS TEST")
    print(f"==================================================")
    print(f"👥 Concurrent Threads : {concurrency}")
    print(f"📦 Total Requests     : {total_requests}")
    print(f"🏢 Tenant Header     : {TENANT}")
    print(f"🎯 Workload Mode     : {'Multi-Scenario Concurrent (Login, Leave, Approvals, Attendance, ATS, Audit Logs)' if is_multi_scenario else target_endpoint}")
    print(f"--------------------------------------------------")

    latencies = []
    status_codes = {}
    scenario_metrics = {}
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        if is_multi_scenario:
            futures = [executor.submit(execute_random_scenario) for _ in range(total_requests)]
        else:
            default_token = USER_TOKENS["admin@awais.com"]
            futures = [executor.submit(lambda: ("Target Endpoint", *send_request(target_endpoint, token=default_token))) for _ in range(total_requests)]
        
        completed = 0
        for future in as_completed(futures):
            scenario_name, code, elapsed = future.result()
            latencies.append(elapsed)
            status_codes[code] = status_codes.get(code, 0) + 1
            
            if scenario_name not in scenario_metrics:
                scenario_metrics[scenario_name] = {"count": 0, "success": 0, "latencies": []}
            scenario_metrics[scenario_name]["count"] += 1
            if 200 <= code < 300:
                scenario_metrics[scenario_name]["success"] += 1
            scenario_metrics[scenario_name]["latencies"].append(elapsed)

            completed += 1
            if completed % (total_requests // 10 or 1) == 0 or completed == total_requests:
                print(f" Progress: {completed}/{total_requests} requests finished...")

    total_time = time.time() - start_time
    rps = total_requests / total_time if total_time > 0 else 0
    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    sorted_latencies = sorted(latencies) if latencies else [0]
    p50 = sorted_latencies[int(len(sorted_latencies) * 0.50)]
    p95 = sorted_latencies[int(len(sorted_latencies) * 0.95)]
    p99 = sorted_latencies[int(len(sorted_latencies) * 0.99)]

    print(f"\n==================================================")
    print(f"📊 LIVE STRESS TEST RESULTS & METRICS")
    print(f"==================================================")
    print(f"⏱️  Total Time Taken      : {total_time:.2f} seconds")
    print(f"⚡ Throughput (RPS)       : {rps:.2f} requests/sec")
    print(f"📈 Average Latency        : {avg_latency:.2f} ms")
    print(f"🎯 50th Percentile (p50)  : {p50:.2f} ms")
    print(f"🎯 95th Percentile (p95)  : {p95:.2f} ms")
    print(f"🎯 99th Percentile (p99)  : {p99:.2f} ms")
    print(f"--------------------------------------------------")
    print(f"Status Code Summary:")
    for code, count in sorted(status_codes.items()):
        symbol = "✅" if 200 <= code < 300 else ("⚠️" if 400 <= code < 500 else "❌")
        print(f"  {symbol} HTTP {code}: {count} requests ({count/total_requests*100:.1f}%)")
    
    if is_multi_scenario:
        print(f"--------------------------------------------------")
        print(f"Scenario Breakdown:")
        for name, metrics in sorted(scenario_metrics.items()):
            sc_count = metrics["count"]
            sc_succ = metrics["success"]
            sc_avg = sum(metrics["latencies"]) / sc_count if sc_count > 0 else 0
            print(f"  🔹 {name:32s}: {sc_count:4d} reqs | {sc_succ/sc_count*100:5.1f}% success | avg {sc_avg:6.2f} ms")

    print(f"==================================================\n")

if __name__ == "__main__":
    concurrency = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    total = int(sys.argv[2]) if len(sys.argv) > 2 else 2000
    target_endpoint = sys.argv[3] if len(sys.argv) > 3 else "multi"
    run_stress_test(concurrency, total, target_endpoint)



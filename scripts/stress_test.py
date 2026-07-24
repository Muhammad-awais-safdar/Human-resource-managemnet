#!/usr/bin/env python3
"""
🚀 Enterprise Multi-Tenant HR Engine - Live Backend Stress Test Runner
=====================================================================
This script performs real-time multi-threaded stress benchmarking against 
the Spring Boot backend container.

Usage:
  python3 scripts/stress_test.py [CONCURRENCY] [TOTAL_REQUESTS]

Example:
  python3 scripts/stress_test.py 50 1000
"""

import sys
import time
import json
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://localhost:8080/api/v1"
TENANT = "awais"

def send_request(endpoint, method="GET", data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req_headers = {"X-Tenant": TENANT}
    if headers:
        req_headers.update(headers)
    
    payload = None
    if data:
        payload = json.dumps(data).encode("utf-8")
        req_headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=payload, headers=req_headers, method=method)
    start = time.time()
    try:
        with urllib.request.urlopen(req) as resp:
            elapsed = (time.time() - start) * 1000
            return resp.status, elapsed
    except urllib.error.HTTPError as e:
        elapsed = (time.time() - start) * 1000
        return e.code, elapsed
    except Exception as e:
        elapsed = (time.time() - start) * 1000
        return 500, elapsed

def run_stress_test(concurrency=50, total_requests=1000, endpoint="/recruitment/jobs"):
    print(f"\n==================================================")
    print(f"🔥 STARTING LIVE BACKEND STRESS TEST")
    print(f"==================================================")
    print(f"🎯 Target Endpoint   : {BASE_URL}{endpoint}")
    print(f"👥 Concurrent Threads : {concurrency}")
    print(f"📦 Total Requests     : {total_requests}")
    print(f"🏢 Tenant Header     : {TENANT}")
    print(f"--------------------------------------------------")

    latencies = []
    status_codes = {}
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(send_request, endpoint) for _ in range(total_requests)]
        
        completed = 0
        for future in as_completed(futures):
            code, elapsed = future.result()
            latencies.append(elapsed)
            status_codes[code] = status_codes.get(code, 0) + 1
            completed += 1
            if completed % (total_requests // 10 or 1) == 0:
                print(f" Progress: {completed}/{total_requests} requests finished...")

    total_time = time.time() - start_time
    rps = total_requests / total_time
    avg_latency = sum(latencies) / len(latencies)
    sorted_latencies = sorted(latencies)
    p50 = sorted_latencies[int(len(sorted_latencies) * 0.50)]
    p95 = sorted_latencies[int(len(sorted_latencies) * 0.95)]
    p99 = sorted_latencies[int(len(sorted_latencies) * 0.99)]

    print(f"\n==================================================")
    print(f"📊 STRESS TEST RESULTS & METRICS")
    print(f"==================================================")
    print(f"⏱️  Total Time Taken      : {total_time:.2f} seconds")
    print(f"⚡ Throughput (RPS)       : {rps:.2f} requests/sec")
    print(f"📈 Average Response Time  : {avg_latency:.2f} ms")
    print(f"🎯 50th Percentile (p50)  : {p50:.2f} ms")
    print(f"🎯 95th Percentile (p95)  : {p95:.2f} ms")
    print(f"🎯 99th Percentile (p99)  : {p99:.2f} ms")
    print(f"--------------------------------------------------")
    print(f"Status Code Breakdown:")
    for code, count in status_codes.items():
        symbol = "✅" if code == 200 else "❌"
        print(f"  {symbol} HTTP {code}: {count} requests ({count/total_requests*100:.1f}%)")
    print(f"==================================================\n")

if __name__ == "__main__":
    concurrency = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    total = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
    run_stress_test(concurrency, total)

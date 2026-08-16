#!/usr/bin/env python3
"""
discover_endpoints.py
---------------------
Automated Backend Endpoint Discovery Script for Awais HR SaaS Platform.
Parses Java Spring Boot Controller source code to generate endpoints.json and ENDPOINT-INVENTORY.md.
"""

import os
import re
import json
from pathlib import Path

BACKEND_SRC = Path("backend/src/main/java")
OUTPUT_JSON = Path("qa/reports/endpoints.json")
OUTPUT_MD = Path("qa/reports/ENDPOINT-INVENTORY.md")

HTTP_ANNOTATIONS = {
    "@GetMapping": "GET",
    "@PostMapping": "POST",
    "@PutMapping": "PUT",
    "@PatchMapping": "PATCH",
    "@DeleteMapping": "DELETE",
    "@RequestMapping": "ANY"
}

SENSITIVE_KEYWORDS = ["password", "secret", "token", "ssn", "salary", "pay", "bank", "creditcard", "commission", "impersonate"]
FINANCIAL_KEYWORDS = ["payroll", "salary", "disbursement", "commission", "piece-rate", "allowance", "bonus", "tax", "billing"]
MAKER_CHECKER_KEYWORDS = ["approve", "disburse", "payout", "settle"]

def clean_value(val_str):
    val = val_str.strip().strip('"').strip("'")
    if val.startswith("value ="):
        val = val.replace("value =", "").strip().strip('"')
    if val.startswith("path ="):
        val = val.replace("path =", "").strip().strip('"')
    return val

def parse_java_controller(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    if "@RestController" not in content and "@Controller" not in content:
        return []

    controller_name = file_path.stem
    
    # Class-level RequestMapping
    class_mapping = ""
    class_map_match = re.search(r'@RequestMapping\(([^)]+)\)', content)
    if class_map_match:
        class_mapping = clean_value(class_map_match.group(1))

    endpoints = []

    # Split into methods approximately by line/signature
    lines = content.splitlines()
    current_permissions = []
    
    for i, line in enumerate(lines):
        line_str = line.strip()

        # Check @HasPermission
        perm_match = re.search(r'@HasPermission\("([^"]+)"\)', line_str)
        if perm_match:
            current_permissions.append(perm_match.group(1))

        # Check HTTP mapping annotations
        for ann, http_method in HTTP_ANNOTATIONS.items():
            if ann in line_str:
                path_suffix = ""
                path_match = re.search(re.escape(ann) + r'\(([^)]+)\)', line_str)
                if path_match:
                    path_suffix = clean_value(path_match.group(1))

                # Normalize full path
                full_path = (class_mapping + "/" + path_suffix).replace("//", "/")
                if not full_path.startswith("/"):
                    full_path = "/" + full_path
                full_path = full_path.rstrip("/")
                if not full_path:
                    full_path = "/"

                perm = current_permissions[-1] if current_permissions else "AUTHENTICATED"
                
                is_sensitive = any(k in full_path.lower() or k in perm.lower() for k in SENSITIVE_KEYWORDS)
                is_financial = any(k in full_path.lower() or k in perm.lower() for k in FINANCIAL_KEYWORDS)
                is_maker_checker = any(k in full_path.lower() for k in MAKER_CHECKER_KEYWORDS)

                endpoints.append({
                    "controller": controller_name,
                    "method": http_method,
                    "endpoint": full_path,
                    "permission": perm,
                    "tenantScoped": True,
                    "sensitive": is_sensitive,
                    "financial": is_financial,
                    "makerChecker": is_maker_checker,
                    "file": str(file_path)
                })
                # Reset permission tracker after mapping method
                current_permissions = []

    return endpoints

def discover():
    all_endpoints = []
    for root, _, files in os.walk(BACKEND_SRC):
        for f in files:
            if f.endswith("Controller.java"):
                file_path = Path(root) / f
                eps = parse_java_controller(file_path)
                all_endpoints.extend(eps)

    # Deduplicate by (method, endpoint)
    seen = set()
    unique_endpoints = []
    for ep in all_endpoints:
        key = (ep["method"], ep["endpoint"])
        if key not in seen:
            seen.add(key)
            unique_endpoints.append(ep)

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(unique_endpoints, f, indent=2)

    # Generate Markdown inventory
    with open(OUTPUT_MD, "w", encoding="utf-8") as f:
        f.write("# Awais HR Platform — Automated API Endpoint Inventory\n\n")
        f.write(f"**Total Discovered Endpoints**: {len(unique_endpoints)}\n\n")
        f.write("| Controller | Method | Endpoint | Permission | Sensitive | Financial | Maker-Checker |\n")
        f.write("|:---|:---|:---|:---|:---|:---|:---|\n")
        for ep in unique_endpoints:
            sens = "YES" if ep["sensitive"] else "NO"
            fin = "YES" if ep["financial"] else "NO"
            mc = "YES" if ep["makerChecker"] else "NO"
            f.write(f"| {ep['controller']} | {ep['method']} | `{ep['endpoint']}` | `{ep['permission']}` | {sens} | {fin} | {mc} |\n")

    print(f"[OK] Endpoint discovery completed: {len(unique_endpoints)} unique endpoints cataloged in {OUTPUT_JSON} and {OUTPUT_MD}.")
    return len(unique_endpoints)

if __name__ == "__main__":
    discover()

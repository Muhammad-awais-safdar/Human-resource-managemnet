import os
import shutil

src = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src"

# Define target directory structure
dirs_to_create = [
    os.path.join(src, "core", "api"),
    os.path.join(src, "core", "config"),
    os.path.join(src, "core", "context"),
    os.path.join(src, "core", "hooks"),
    os.path.join(src, "core", "primitives"),
    os.path.join(src, "core", "shell"),
    os.path.join(src, "core", "styles"),
    os.path.join(src, "modules", "auth", "components"),
    os.path.join(src, "modules", "auth", "pages"),
    os.path.join(src, "modules", "auth", "services"),
    os.path.join(src, "modules", "auth", "styles"),
    os.path.join(src, "modules", "dashboard", "components"),
    os.path.join(src, "modules", "dashboard", "pages"),
    os.path.join(src, "modules", "dashboard", "services"),
    os.path.join(src, "modules", "employees", "components"),
    os.path.join(src, "modules", "employees", "pages"),
    os.path.join(src, "modules", "employees", "services"),
    os.path.join(src, "modules", "payroll", "components"),
    os.path.join(src, "modules", "payroll", "pages"),
    os.path.join(src, "modules", "payroll", "services"),
    os.path.join(src, "modules", "approvals", "components"),
    os.path.join(src, "modules", "approvals", "pages"),
    os.path.join(src, "modules", "approvals", "services"),
    os.path.join(src, "modules", "recruitment", "components"),
    os.path.join(src, "modules", "recruitment", "pages"),
    os.path.join(src, "modules", "recruitment", "services"),
    os.path.join(src, "modules", "self-service", "components"),
    os.path.join(src, "modules", "self-service", "pages"),
    os.path.join(src, "modules", "self-service", "services"),
    os.path.join(src, "modules", "time-management", "components"),
    os.path.join(src, "modules", "time-management", "pages"),
    os.path.join(src, "modules", "time-management", "services"),
    os.path.join(src, "modules", "performance", "components"),
    os.path.join(src, "modules", "performance", "pages"),
    os.path.join(src, "modules", "performance", "services"),
    os.path.join(src, "modules", "administration", "components"),
    os.path.join(src, "modules", "administration", "pages"),
    os.path.join(src, "modules", "administration", "services"),
    os.path.join(src, "router"),
]

for d in dirs_to_create:
    os.makedirs(d, exist_ok=True)

print("Modular directories created successfully.")

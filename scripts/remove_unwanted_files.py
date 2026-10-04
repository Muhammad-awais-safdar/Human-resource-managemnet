import os
import shutil

src_dir = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src"
frontend_dir = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend"

# Subdirectories in src/ to remove (since everything is now in src/core, src/modules, src/router)
unwanted_src_dirs = [
    "app",
    "components",
    "context",
    "hooks",
    "lib",
    "pages",
    "routes",
    "services",
    "styles",
    "utils",
]

for d in unwanted_src_dirs:
    target_path = os.path.join(src_dir, d)
    if os.path.exists(target_path):
        if os.path.isdir(target_path):
            shutil.rmtree(target_path)
            print(f"Removed directory: {target_path}")
        else:
            os.remove(target_path)
            print(f"Removed file: {target_path}")

# Top-level legacy files/directories in frontend/ to remove
unwanted_frontend_items = [
    ".next",
    "next.config.mjs",
]

for item in unwanted_frontend_items:
    target_path = os.path.join(frontend_dir, item)
    if os.path.exists(target_path):
        if os.path.isdir(target_path):
            shutil.rmtree(target_path)
            print(f"Removed directory: {target_path}")
        else:
            os.remove(target_path)
            print(f"Removed file: {target_path}")

print("Clean-up of unwanted files and folders completed successfully.")

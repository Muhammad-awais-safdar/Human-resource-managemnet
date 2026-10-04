import os
import shutil

src_dir = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src"
frontend_dir = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend"

deprecated_src_items = [
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

for item in deprecated_src_items:
    path = os.path.join(src_dir, item)
    if os.path.exists(path):
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f"Deleted directory: {path}")
            else:
                os.remove(path)
                print(f"Deleted file: {path}")
        except Exception as e:
            print(f"Error removing {path}: {e}")

deprecated_frontend_items = [
    ".next",
    "next.config.mjs",
]

for item in deprecated_frontend_items:
    path = os.path.join(frontend_dir, item)
    if os.path.exists(path):
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f"Deleted directory: {path}")
            else:
                os.remove(path)
                print(f"Deleted file: {path}")
        except Exception as e:
            print(f"Error removing {path}: {e}")

print("Deletion of deprecated files complete.")

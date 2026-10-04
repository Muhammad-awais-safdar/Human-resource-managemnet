import os
import shutil

legacy_app_dir = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src/app"

if os.path.exists(legacy_app_dir):
    shutil.rmtree(legacy_app_dir)
    print(f"Removed legacy Next.js app directory: {legacy_app_dir}")
else:
    print("Legacy Next.js app directory already removed.")

import os
import shutil

src = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend/src"

legacy_dirs = ["app", "pages", "routes", "services", "components", "context", "styles"]

for d in legacy_dirs:
    target = os.path.join(src, d)
    if os.path.exists(target):
        shutil.rmtree(target)
        print(f"Cleaned up legacy directory: {d}")

print("Frontend src directory cleaned up.")

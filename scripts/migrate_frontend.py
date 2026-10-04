import os
import shutil

base_dir = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend"
target_dir = os.path.join(base_dir, "frontend-next")

os.makedirs(target_dir, exist_ok=True)

items = os.listdir(base_dir)
for item in items:
    if item == "frontend-next":
        continue
    src_path = os.path.join(base_dir, item)
    dst_path = os.path.join(target_dir, item)
    if not os.path.exists(dst_path):
        if os.path.isdir(src_path):
            shutil.copytree(src_path, dst_path, dirs_exist_ok=True)
            print(f"Copied directory {item} to frontend-next/")
        else:
            shutil.copy2(src_path, dst_path)
            print(f"Copied file {item} to frontend-next/")

print("Migration backup to frontend-next completed successfully.")

import os
import shutil

src_root = "/home/awais/awais/projects/spring-boot/Human-resource-managemnet/frontend"
dst_root = os.path.join(src_root, "frontend-next")

items_to_copy = [
    "src/app",
    "src/components",
    "src/context",
    "src/hooks",
    "src/lib",
    "src/modules",
    "src/utils",
    "public",
    "next.config.mjs",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "jsconfig.json",
    "AGENTS.md",
    "CLAUDE.md",
    "Dockerfile",
    "README.md",
    ".env",
    ".env.example",
    ".dockerignore",
    ".gitignore",
]

for rel_path in items_to_copy:
    src_item = os.path.join(src_root, rel_path)
    dst_item = os.path.join(dst_root, rel_path)
    
    if os.path.exists(src_item):
        os.makedirs(os.path.dirname(dst_item), exist_ok=True)
        if os.path.isdir(src_item):
            shutil.copytree(src_item, dst_item, dirs_exist_ok=True)
            print(f"Copied directory: {rel_path}")
        else:
            shutil.copy2(src_item, dst_item)
            print(f"Copied file: {rel_path}")

print("Legacy Next.js project backup complete.")

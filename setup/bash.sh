#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# ====== CẤU HÌNH ======
REPO_URL="https://github.com/USER/REPO.git"   # <-- sửa link repo của bạn
PROJECT_DIRNAME="my_autojs_project"          # <-- tên thư mục sẽ tạo trong scripts

# Auto.js scripts path (hay dùng nhất)
AUTOJS_SCRIPTS_DIR="/sdcard/Auto.js/scripts"

# (Tuỳ bản Auto.js, đôi khi là /sdcard/autojs/scripts hoặc /sdcard/AutoJS/scripts)
ALT_DIRS=(
  "/sdcard/autojs/scripts"
  "/sdcard/AutoJS/scripts"
)

# ====== HÀM TIỆN ÍCH ======
log() { echo -e "\n[+] $*\n"; }
warn() { echo -e "\n[!] $*\n" >&2; }
die() { echo -e "\n[✗] $*\n" >&2; exit 1; }

ensure_termux_storage() {
  if [ ! -d "/sdcard" ]; then
    log "Xin quyền truy cập bộ nhớ (termux-setup-storage)..."
    termux-setup-storage
  fi
}

ensure_pkgs() {
  log "Cập nhật package & cài git..."
  pkg update -y
  pkg install -y git openssh
}

pick_scripts_dir() {
  if [ -d "$AUTOJS_SCRIPTS_DIR" ]; then
    echo "$AUTOJS_SCRIPTS_DIR"
    return
  fi

  for d in "${ALT_DIRS[@]}"; do
    if [ -d "$d" ]; then
      echo "$d"
      return
    fi
  done

  # Nếu chưa có, tạo theo đường dẫn mặc định
  mkdir -p "$AUTOJS_SCRIPTS_DIR"
  echo "$AUTOJS_SCRIPTS_DIR"
}

sync_repo() {
  local scripts_dir="$1"
  local target="$scripts_dir/$PROJECT_DIRNAME"

  log "Thư mục scripts: $scripts_dir"
  log "Repo sẽ nằm tại: $target"

  if [ -d "$target/.git" ]; then
    log "Đã có repo -> git pull"
    git -C "$target" pull --ff-only
    log "Xong: pull cập nhật."
    return
  fi

  if [ -d "$target" ] && [ ! -d "$target/.git" ]; then
    die "Thư mục '$target' đã tồn tại nhưng không phải git repo (.git không có). Hãy đổi PROJECT_DIRNAME hoặc xoá/thay tên thư mục đó."
  fi

  log "Chưa có -> git clone"
  git clone "$REPO_URL" "$target"
  log "Xong: clone."
}

# ====== MAIN ======
ensure_termux_storage
ensure_pkgs

SCRIPTS_DIR="$(pick_scripts_dir)"
sync_repo "$SCRIPTS_DIR"

log "Hoàn tất."

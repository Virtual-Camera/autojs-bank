#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# ====== CẤU HÌNH ======
REPO_URL="git@github.com:Virtual-Camera/autojs-bank.git"   # <-- sửa link repo của bạn
PROJECT_DIRNAME="AutoBank"          # <-- tên thư mục sẽ tạo trong scripts

# Auto.js scripts path (hay dùng nhất)
AUTOJS_SCRIPTS_DIR="/sdcard/Scripts"

# (Tuỳ bản Auto.js, đôi khi là /sdcard/autojs/scripts hoặc /sdcard/AutoJS/scripts)
ALT_DIRS=(
#   "/sdcard/autojs/scripts"
#   "/sdcard/AutoJS/scripts"
)

# ====== HÀM TIỆN ÍCH ======
log() { echo -e "\n[+] $*\n"; }
warn() { echo -e "\n[!] $*\n" >&2; }
die() { echo -e "\n[✗] $*\n" >&2; exit 1; }

ensure_termux_storage() {
  if [ ! -d "/sdcard" ]; then
    log "Request storage permission (termux-setup-storage)..."
    termux-setup-storage
  fi
}

ensure_pkgs() {
  log "Updating package & installing git..."
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

  log "Scripts directory: $scripts_dir"
  log "Repo will be cloned to: $target"

  if [ -d "$target/.git" ]; then
    log "Repo exists -> git pull"
    git -C "$target" pull --ff-only
    log "Done: pull updated."
    return
  fi

  if [ -d "$target" ] && [ ! -d "$target/.git" ]; then
    die "Folder '$target' already exists but is not a git repo (.git folder is missing). Please change PROJECT_DIRNAME or remove/replace the folder."
  fi

  log "Repo not found -> git clone"
  git clone "$REPO_URL" "$target"
  log "Done: clone."
}

# ====== MAIN ======
log "Starting..."
log "Ensure Termux storage..."
ensure_termux_storage
log "Ensure packages..."
ensure_pkgs
log "Pick scripts directory..."
SCRIPTS_DIR="$(pick_scripts_dir)"
sync_repo "$SCRIPTS_DIR"

log "Done."

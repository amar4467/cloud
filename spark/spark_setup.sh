#!/usr/bin/env bash
set -Eeuo pipefail
umask 022

# Hadoop 3.3.6 + Spark 3.5.7 single-VM lab setup.
# Target: Ubuntu/Debian Linux, 2 GB RAM, Java 11, local Spark execution.
# Run as your normal VM user, NOT with sudo:
#   chmod +x setup-spark-lab.sh
#   ./setup-spark-lab.sh

HADOOP_VERSION="3.3.6"
SPARK_VERSION="3.5.7"
HADOOP_HOME="/usr/local/hadoop"
SPARK_HOME="/usr/local/spark"
LAB_DIR="$HOME/sparklab"
DOWNLOAD_DIR="$HOME/Downloads"
TMPDIR="$HOME/my_temp"
SWAPFILE="/swapfile"
SWAP_SIZE="3G"

log() { printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"; }

on_error() {
  rc=$?
  printf '\nERROR: command failed at line %s (exit %s).\n' "${BASH_LINENO[0]:-unknown}" "$rc" >&2
  printf 'Check the last output above. The script stops rather than formatting existing HDFS data or silently continuing.\n' >&2
  exit "$rc"
}
trap on_error ERR

[[ "$(id -u)" -ne 0 ]] || die "Run this script as your normal user, not root or with sudo."
[[ -r /etc/os-release ]] || die "Cannot identify Linux distribution."
. /etc/os-release
case "${ID:-}" in ubuntu|debian|linuxmint|pop) ;; *) die "This script supports Ubuntu/Debian-based Linux. Detected: ${ID:-unknown}";; esac

ARCH="$(dpkg --print-architecture)"
case "$ARCH" in amd64|arm64) ;; *) die "Unsupported architecture: $ARCH";; esac

mkdir -p "$DOWNLOAD_DIR" "$TMPDIR" "$LAB_DIR"
export TMPDIR
export DEBIAN_FRONTEND=noninteractive

log "1. Install Java 11, SSH, download tools and Python"
sudo apt-get update
sudo apt-get install -y openjdk-11-jdk openssh-server curl wget ca-certificates tar gzip procps python3 python3-venv python3-pip
need_cmd java
need_cmd ssh
need_cmd curl
need_cmd tar

JAVA_BIN="$(readlink -f "$(command -v java)")"
JAVA_HOME="$(dirname "$(dirname "$JAVA_BIN")")"
[[ -x "$JAVA_HOME/bin/java" ]] || die "Could not determine JAVA_HOME from $JAVA_BIN"
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$SPARK_HOME/bin:$PATH"
java -version

log "2. Configure passwordless localhost SSH"
sudo service ssh start
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
if [[ ! -f "$HOME/.ssh/id_ed25519" ]]; then
  ssh-keygen -t ed25519 -N '' -f "$HOME/.ssh/id_ed25519"
fi
touch "$HOME/.ssh/authorized_keys"
chmod 600 "$HOME/.ssh/authorized_keys"
PUBKEY="$(cat "$HOME/.ssh/id_ed25519.pub")"
grep -qxF "$PUBKEY" "$HOME/.ssh/authorized_keys" || printf '%s\n' "$PUBKEY" >> "$HOME/.ssh/authorized_keys"
ssh -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=accept-new localhost true

log "3. Configure swap safely (3 GB)"
if grep -qE '^[^ ]+[[:space:]]+swap[[:space:]]' /proc/swaps; then
  echo "Swap is already active:"
  cat /proc/swaps
elif [[ -e "$SWAPFILE" ]]; then
  echo "$SWAPFILE exists but is not active; attempting to enable it."
  sudo chmod 600 "$SWAPFILE"
  sudo swapon "$SWAPFILE"
else
  AVAIL_KB="$(df -Pk / | awk 'NR==2 {print $4}')"
  # 3 GiB = 3,145,728 KiB; keep at least 1 GiB free after creating it.
  if (( AVAIL_KB < 4194304 )); then
    echo "Not enough free root-disk space for a 3 GB swapfile plus 1 GB reserve."
    echo "Continuing without creating swap; monitor memory closely."
  else
    sudo fallocate -l "$SWAP_SIZE" "$SWAPFILE" || {
      echo "fallocate failed; trying a slower dd fallback."
      sudo dd if=/dev/zero of="$SWAPFILE" bs=1M count=3072 status=progress
    }
    sudo chmod 600 "$SWAPFILE"
    sudo mkswap "$SWAPFILE"
    sudo swapon "$SWAPFILE"
    grep -qE '^[[:space:]]*/swapfile[[:space:]]' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  fi
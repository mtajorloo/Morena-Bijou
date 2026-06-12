#!/usr/bin/env bash
# compress-frames.sh <frames-dir> [width=1600] [quality=88]
# Resizes and re-compresses frames for fast load (<15MB/section).
set -e
FFMPEG=$(which ffmpeg 2>/dev/null || echo /tmp/ffmpeg-bin/ffmpeg)
DIR="$1"; W="${2:-1600}"; Q="${3:-88}"
[ -z "$DIR" ] && { echo "Usage: $0 <frames-dir> [width] [quality]"; exit 1; }
for f in "$DIR"/frame_*.jpg; do
  "$FFMPEG" -y -i "$f" -vf "scale=$W:-2" -q:v "$Q" "$f" 2>/dev/null
done
echo "Compressed $(ls "$DIR"/*.jpg | wc -l) frames in $DIR (${W}px, q${Q})"

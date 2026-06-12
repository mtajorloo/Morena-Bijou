#!/usr/bin/env bash
# extract-frames.sh <input.mp4> <output-dir> [frame-count=180]
# Slices a video into numbered JPGs for scroll scrubbing.
set -e
FFMPEG=$(which ffmpeg 2>/dev/null || echo /tmp/ffmpeg-bin/ffmpeg)
INPUT="$1"; OUTDIR="$2"; N="${3:-180}"
[ -z "$INPUT" ] && { echo "Usage: $0 <video.mp4> <out-dir> [frames]"; exit 1; }
mkdir -p "$OUTDIR"
DURATION=$("$FFMPEG" -i "$INPUT" 2>&1 | grep Duration | awk '{print $2}' | tr -d , | awk -F: '{print ($1*3600)+($2*60)+$3}')
FPS=$(echo "scale=4; ($N-1)/$DURATION" | bc)
"$FFMPEG" -i "$INPUT" -vf "fps=$FPS" -q:v 2 "$OUTDIR/frame_%04d.jpg"
echo "Extracted $(ls "$OUTDIR"/*.jpg | wc -l) frames → $OUTDIR"

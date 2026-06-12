#!/usr/bin/env python3
"""
Morena Bijou · Cinematic Frame Generator
Renders 180-frame sequences using numpy ray-shading for both scrub sections.
No external dependencies beyond numpy + Pillow.
"""
import math, os, sys, time
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

W, H, N = 1600, 900, 180
os.makedirs("frames/spin",   exist_ok=True)
os.makedirs("frames/reveal", exist_ok=True)

# ─── Shared helpers ──────────────────────────────────────────────────────────

def radial_gradient(cx, cy, r, color, out_arr, strength=1.0):
    """Additive radial glow painted into float32 RGB array."""
    yy, xx = np.ogrid[:H, :W]
    dist = np.sqrt((xx - cx)**2 + (yy - cy)**2)
    mask = np.clip(1.0 - dist / r, 0, 1) ** 2 * strength
    for ch, val in enumerate(color):
        out_arr[:, :, ch] += mask * val

def vignette(arr, strength=0.55):
    yy, xx = np.ogrid[:H, :W]
    dx = (xx - W/2) / (W/2)
    dy = (yy - H/2) / (H/2)
    v  = np.clip(1.0 - (dx**2 + dy**2)**0.7 * strength, 0, 1)
    arr *= v[:, :, np.newaxis]

def save(arr, path):
    arr8 = np.clip(arr * 255, 0, 255).astype(np.uint8)
    img  = Image.fromarray(arr8)
    img  = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    img.save(path, 'JPEG', quality=90)

def progress(i, total, label):
    pct = int(100 * i / total)
    bar = '#' * (pct // 4) + '.' * (25 - pct // 4)
    sys.stdout.write(f"\r  [{bar}] {pct:3d}%  frame {i}/{total}  {label}")
    sys.stdout.flush()


# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 1 · SPIN  —  Floating pendant, full 360° orbit of a key light
# ══════════════════════════════════════════════════════════════════════════════

def render_gem_facets(arr, cx, cy, angle, scale=1.0, alpha=1.0, hue_shift=0.0):
    """
    Render a cut-gemstone (modified brilliant) as vectorised flat-shading.
    hue_shift rotates the ruby tint toward a second colour (for the reveal).
    """
    if scale < 0.02 or alpha < 0.01:
        return arr
    # Base ruby colour  (r,g,b) floats
    ruby_body = np.array([0.52, 0.07, 0.14])
    ruby_hi   = np.array([0.92, 0.25, 0.32])
    gold_hi   = np.array([0.95, 0.82, 0.25])

    if hue_shift > 0:
        # shift toward blue/purple for variety in reveal
        blue = np.array([0.18, 0.12, 0.70])
        ruby_body = (1-hue_shift)*ruby_body + hue_shift*blue
        ruby_hi   = (1-hue_shift)*ruby_hi   + hue_shift*np.array([0.55,0.55,1.0])

    # Facet definitions: (rel_x, rel_y, width, height, rotation_rad, brightness)
    # Teardrop cut — crown girdle pavilion
    r_w = int(75 * scale)
    r_h = int(115 * scale)

    yy, xx = np.ogrid[:H, :W]

    # --- body ellipse (pavilion) ---
    ex = (xx - cx) / r_w
    ey = (yy - cy) / r_h
    inside = (ex**2 + ey**2) <= 1.0
    inside3 = inside[:, :, np.newaxis]

    # Normal-based shading from key light at (angle)
    lx = math.cos(angle); ly = -math.sin(angle) * 0.4
    _r = np.maximum(np.sqrt(ex**2 + ey**2), 0.001)
    surf_nx = np.nan_to_num(ex / _r)
    surf_ny = np.nan_to_num(ey / _r)
    diffuse = np.clip(surf_nx * lx + surf_ny * ly, 0.0, 1.0)

    # Specular blinn-phong
    h_x = (lx + 0.0) / math.sqrt(lx**2 + 1 + 0.01)  # approx half-vec
    h_y = (ly - 0.5) / math.sqrt(ly**2 + 1 + 0.01)
    spec_dot = np.clip(surf_nx * h_x + surf_ny * h_y, 0, 1)
    specular = spec_dot ** 48 * 1.8

    # internal caustic streaks (simulated with sin patterns)
    caustic = (np.sin(ex * 9 + angle * 3) * np.sin(ey * 7 - angle * 2)) * 0.15
    caustic = np.clip(caustic, 0, 0.3)

    body_col = (ruby_body[np.newaxis, np.newaxis, :]
                * (0.25 + diffuse[:, :, np.newaxis] * 0.6
                   + caustic[:, :, np.newaxis]))
    hi_col   = ruby_hi[np.newaxis, np.newaxis, :] * specular[:, :, np.newaxis]
    gem      = (body_col + hi_col) * alpha

    arr[:] = np.where(inside3, arr * 0.05 + gem, arr)

    # --- gold setting ring around girdle ---
    ring_w = 9 * scale
    ring_outer = (ex**2 + ey**2) <= ((r_w + ring_w)/r_w)**2 * 1.0
    ring_mask  = ring_outer & ~inside
    ring_bright = np.clip(0.55 + 0.45 * np.sin(
        np.arctan2(ey, ex) * 8 + angle * 2), 0.3, 1.0)
    gold_col = gold_hi[np.newaxis, np.newaxis, :] * ring_bright[:, :, np.newaxis] * 0.8
    ring3    = ring_mask[:, :, np.newaxis]
    arr[:] = np.where(ring3, arr * 0.3 + gold_col * alpha, arr)

    # --- crown table facets (top) ---
    crown_h  = int(r_h * 0.45)
    crown_w  = int(r_w * 0.78)
    ce_x = (xx - cx) / crown_w
    ce_y = (yy - (cy - r_h * 0.22)) / crown_h
    crown_in = (ce_x**2 + ce_y**2) <= 1.0
    crown_diff = np.clip(ce_x * lx * 0.6 + 0.5, 0.2, 1.0)
    crown_spec = np.clip(ce_x * lx * 2 + lx, 0, 1) ** 32
    crown_col  = (ruby_body * 0.4 + ruby_hi * crown_diff[:, :, np.newaxis] * 0.4
                  + gold_hi * crown_spec[:, :, np.newaxis] * 0.9)
    crown3     = (crown_in & inside)[:, :, np.newaxis]
    arr[:] = np.where(crown3, arr * 0.2 + crown_col * alpha, arr)

    return arr


def render_chain(arr, angle, cx_base, cy_base):
    """
    Gold chain — two arced strands with per-link specular highlight.
    Uses PIL draw for fine lines blended back in.
    """
    from PIL import ImageDraw
    layer = Image.new('RGB', (W, H), (0, 0, 0))
    d     = ImageDraw.Draw(layer)

    # perspective squish based on camera angle around Y axis
    persp = abs(math.cos(angle)) * 0.55 + 0.45

    # two parallel strands offset slightly
    for strand_off in [-4, 4]:
        pts = []
        for k in range(120):
            a2   = -math.pi + k / 119 * math.pi   # -π → +π arc
            rx   = 165 * persp
            ry   = 52 * persp
            x    = cx_base + int(rx * math.sin(a2)) + strand_off
            y    = cy_base - 175 + int(ry * math.cos(a2) * 0.45)
            pts.append((x, y))
        # draw segment by segment with varying brightness
        for k in range(len(pts) - 1):
            bright = 0.35 + 0.65 * abs(math.sin(angle + k * 0.22))
            r = int(201 * bright); g = int(168 * bright); b = int(76 * bright * 0.85)
            d.line([pts[k], pts[k+1]], fill=(r, g, b), width=3)

    chain_arr = np.array(layer).astype(np.float32) / 255.0
    mask      = (chain_arr.sum(axis=2) > 0.02)[:, :, np.newaxis]
    arr[:]    = np.where(mask, np.clip(arr + chain_arr * 0.9, 0, 1), arr)
    return arr


def render_bail(arr, cx, top_y, angle):
    """Small gold bail connector above the pendant."""
    layer = Image.new('RGB', (W, H), (0, 0, 0))
    d     = ImageDraw.Draw(layer)
    bw    = max(3, int(14 * (abs(math.cos(angle)) * 0.4 + 0.6)))
    bh    = 22
    bx    = cx - bw; by = top_y
    bright = 0.6 + 0.4 * abs(math.cos(angle * 2))
    r = int(240 * bright); g = int(200 * bright); b = int(80 * bright)
    d.rectangle([bx, by, bx + bw*2, by + bh], fill=(r, g, b))
    bail_arr = np.array(layer).astype(np.float32) / 255.0
    mask = (bail_arr.sum(axis=2) > 0.0)[:, :, np.newaxis]
    arr[:] = np.where(mask, bail_arr * 0.85, arr)
    return arr


def render_spin_frame(i):
    t     = i / (N - 1)
    angle = t * 2 * math.pi          # 0 → 2π full revolution

    arr = np.zeros((H, W, 3), dtype=np.float32)

    cx, cy = W // 2, H // 2 + 30     # pendant center

    # ── Background deep volumetric glow ──
    # key light glow follows orbit
    kx = cx + 280 * math.cos(angle)
    ky = cy - 120 + 60 * math.sin(angle) * 0.4
    radial_gradient(kx, ky, 420, (0.22, 0.14, 0.04), arr, strength=1.0)
    radial_gradient(cx, cy, 260, (0.10, 0.02, 0.04), arr, strength=0.6)
    # fill light opposite side
    fx = cx - 200 * math.cos(angle)
    radial_gradient(fx, cy, 300, (0.04, 0.02, 0.07), arr, strength=0.4)

    # ── Chain ──
    arr = render_chain(arr, angle, cx, cy)

    # ── Bail ──
    arr = render_bail(arr, cx, cy - 148, angle)

    # ── Gem pendant ──
    arr = render_gem_facets(arr, cx, cy, angle, scale=1.0)

    # ── Floor reflection (subtle) ──
    ref_y = cy + 145
    ref_arr = np.zeros((H, W, 3), dtype=np.float32)
    render_gem_facets(ref_arr, cx, ref_y + 30, angle + math.pi, scale=0.35, alpha=0.12)
    arr += ref_arr
    arr[ref_y:, :, :] *= np.linspace(1, 0, H - ref_y)[:, np.newaxis, np.newaxis] * 0.4

    # ── Key light sparkle ──
    for s in range(3):
        sx = cx + int((70 + s*25) * math.cos(angle + s * 0.9))
        sy = cy + int((40 + s*15) * math.sin(angle + s * 0.9) * 0.5)
        pulse = (math.sin(t * math.pi * 6 + s * 2) * 0.5 + 0.5)
        radial_gradient(sx, sy, 18 + s*4, (pulse*0.9, pulse*0.7, pulse*0.1), arr, strength=0.6)

    vignette(arr, strength=0.65)
    np.clip(arr, 0, 1, out=arr)
    # slight filmic tone (lift blacks, crush highlights gently)
    arr = arr ** 0.9 * 0.95 + 0.02
    return arr


# ══════════════════════════════════════════════════════════════════════════════
#  SECTION 2 · REVEAL  —  Facets scatter → gemstone assembles + light burst
# ══════════════════════════════════════════════════════════════════════════════

FACET_SEEDS = [
    # (base_angle, dist_factor, size, hue_shift)
    (0.0,   1.0, 28, 0.0),
    (0.52,  0.9, 22, 0.1),
    (1.05,  1.1, 25, 0.0),
    (1.57,  0.85, 30, 0.15),
    (2.09,  1.0, 20, 0.05),
    (2.62,  0.95, 26, 0.0),
    (3.14,  1.05, 24, 0.1),
    (3.67,  0.9, 28, 0.0),
    (4.19,  1.1, 22, 0.2),
    (4.71,  0.8, 32, 0.0),
    (5.24,  1.0, 20, 0.08),
    (5.76,  0.95, 26, 0.0),
    # inner ring
    (0.26,  0.45, 15, 0.3),
    (1.31,  0.5,  18, 0.2),
    (2.36,  0.42, 16, 0.15),
    (3.40,  0.48, 17, 0.25),
    (4.45,  0.44, 14, 0.0),
    (5.50,  0.50, 16, 0.1),
]

def render_reveal_frame(i):
    t     = i / (N - 1)              # 0 → 1
    # ease: slow start, fast collapse, slow settle
    ease  = 1.0 - (1.0 - t) ** 2.2

    arr = np.zeros((H, W, 3), dtype=np.float32)
    cx, cy = W // 2, H // 2

    # ── Background: deep space, colour shifts warm as piece assembles ──
    warm = ease * 0.18
    radial_gradient(cx, cy, 500, (warm * 0.8, warm * 0.3, warm * 0.05), arr, strength=1.0)
    radial_gradient(cx, cy, 200, (0.06, 0.01, 0.08), arr, strength=0.8)

    yy, xx = np.ogrid[:H, :W]

    # ── Scattered facets ──
    for (base_a, dist_f, size, hue) in FACET_SEEDS:
        spread = (1.0 - ease) ** 1.4 * 380 * dist_f
        # slight orbit drift as they fall in
        drift  = base_a + (1 - ease) * 0.8
        fx     = cx + spread * math.cos(drift)
        fy     = cy + spread * math.sin(drift) * 0.65

        # facet polygon as ellipse
        fw = max(3, int(size * (0.35 + 0.65 * ease)))
        fh = max(3, int(size * 0.7 * (0.35 + 0.65 * ease)))

        ex_f = (xx - fx) / max(fw, 1)
        ey_f = (yy - fy) / max(fh, 1)
        mask = (ex_f**2 + ey_f**2) <= 1.0

        # colour by hue and scatter progress
        bright = 0.4 + 0.6 * ease + 0.2 * math.sin(t * math.pi * 4 + base_a)
        if hue < 0.12:
            col = np.array([0.85, 0.18, 0.22]) * bright
        elif hue < 0.22:
            col = np.array([0.90, 0.75, 0.20]) * bright
        else:
            col = np.array([0.35, 0.30, 0.95]) * bright

        spec = (np.clip(-ex_f * 0.7 + ey_f * 0.3, 0, 1) ** 3) * 1.2
        col3 = col[np.newaxis, np.newaxis, :] + spec[:, :, np.newaxis] * 0.4
        mask3 = mask[:, :, np.newaxis]
        arr[:] = np.where(mask3, np.clip(col3, 0, 1), arr)

    # ── Light rays converging as t → 1 ──
    if ease > 0.25:
        ray_strength = (ease - 0.25) / 0.75
        for ray_i in range(8):
            ra = ray_i * math.pi / 4 + t * 0.3
            ray_len = int(350 * ray_strength)
            for d in range(0, ray_len, 3):
                rx = int(cx + d * math.cos(ra))
                ry = int(cy + d * math.sin(ra) * 0.6)
                if 0 <= rx < W and 0 <= ry < H:
                    fade = (1 - d / ray_len) ** 1.8 * ray_strength * 0.08
                    arr[ry, rx, 0] += fade * 0.95
                    arr[ry, rx, 1] += fade * 0.78
                    arr[ry, rx, 2] += fade * 0.20

    # ── Assembled gem appears in second half ──
    if ease > 0.45:
        gem_scale  = (ease - 0.45) / 0.55
        gem_angle  = t * math.pi * 0.5      # slow rotation as it assembles
        arr = render_gem_facets(arr, cx, cy, gem_angle,
                                scale=gem_scale, alpha=gem_scale, hue_shift=0.0)

    # ── Central burst flash at t≈0.6 ──
    flash_t    = math.exp(-((t - 0.62) ** 2) / 0.006) * 0.55
    radial_gradient(cx, cy, 180, (flash_t * 0.9, flash_t * 0.7, flash_t * 0.2), arr,
                    strength=1.0)

    vignette(arr, strength=0.6)
    np.clip(arr, 0, 1, out=arr)
    arr = arr ** 0.88 * 0.96 + 0.015
    return arr


# ══════════════════════════════════════════════════════════════════════════════
#  RENDER BOTH SECTIONS
# ══════════════════════════════════════════════════════════════════════════════

def render_section(name, fn, out_dir):
    t0 = time.time()
    print(f"\n▶  Rendering [{name}] — {N} frames at {W}×{H}…")
    for i in range(N):
        progress(i + 1, N, name)
        arr  = fn(i)
        path = os.path.join(out_dir, f"frame_{i:04d}.jpg")
        save(arr, path)
    elapsed = time.time() - t0
    print(f"\n   ✓ Done in {elapsed:.1f}s  →  {out_dir}/")

import glob as _glob
_spin_done = len(_glob.glob("frames/spin/frame_*.jpg")) >= N
if not _spin_done:
    render_section("spin",   render_spin_frame,   "frames/spin")
else:
    print(f"\n✓  [spin] already rendered — skipping.")

render_section("reveal", render_reveal_frame, "frames/reveal")
print("\n✅  All cinematic frames ready.\n")

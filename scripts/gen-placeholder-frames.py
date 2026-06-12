#!/usr/bin/env python3
"""
Generate placeholder scroll frames for Morena Bijou site.
Spin section: gold necklace turntable simulation (rotating light on dark bg).
Reveal section: gemstone components assembling from scattered to centered.
Replace frames with Higgsfield-generated clips when auth is fixed.
"""
import math, os
from PIL import Image, ImageDraw, ImageFilter

W, H, N = 1600, 900, 180

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

DARK_BG   = hex_to_rgb('#080608')
GOLD      = hex_to_rgb('#C9A84C')
GOLD_LITE = hex_to_rgb('#F0D080')
RUBY      = hex_to_rgb('#9B1B30')
RUBY_LITE = hex_to_rgb('#E0405A')
WHITE     = (255, 255, 255)

def lerp_color(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def make_spin_frame(i):
    """Rotating gold necklace silhouette with orbiting light streak."""
    img = Image.new('RGB', (W, H), DARK_BG)
    d   = ImageDraw.Draw(img)
    t   = i / (N - 1)          # 0→1
    angle = t * 2 * math.pi    # full revolution

    cx, cy = W // 2, H // 2

    # --- ambient glow behind piece ---
    glow = Image.new('RGB', (W, H), DARK_BG)
    gd = ImageDraw.Draw(glow)
    gw = int(300 + 80 * math.sin(angle))
    gh = int(220 + 60 * math.cos(angle))
    for r in range(120, 0, -8):
        alpha = int(18 * (r / 120))
        c = lerp_color(DARK_BG, (180, 140, 40), r / 120)
        gd.ellipse([cx - gw * r//120, cy - gh * r//120,
                    cx + gw * r//120, cy + gh * r//120], fill=c)
    img = Image.blend(img, glow, 0.6)
    d = ImageDraw.Draw(img)

    # --- necklace chain arc ---
    chain_pts = []
    for k in range(80):
        a2 = -math.pi/2 + k / 79 * math.pi      # half-circle top arc
        rx = 180 + 30 * math.cos(angle)           # perspective squish
        ry = 60
        x = cx + int(rx * math.cos(a2))
        y = cy - 120 + int(ry * math.sin(a2) * 0.5)
        chain_pts.append((x, y))
    if len(chain_pts) >= 2:
        for k in range(len(chain_pts) - 1):
            bright = 0.4 + 0.6 * abs(math.sin(angle + k * 0.2))
            gc = lerp_color((30, 20, 5), GOLD_LITE, bright)
            d.line([chain_pts[k], chain_pts[k+1]], fill=gc, width=3)

    # --- pendant teardrop ---
    px, py = cx, cy + 40
    tdrop_w = int(55 + 20 * abs(math.cos(angle)))
    tdrop_h = 90
    # body
    d.ellipse([px - tdrop_w, py - tdrop_h//2,
               px + tdrop_w, py + tdrop_h//2], fill=RUBY)
    # highlight spec orbiting
    sx = px + int(tdrop_w * 0.5 * math.cos(angle + 0.3))
    sy = py - int(tdrop_h * 0.3 * math.sin(angle + 0.3))
    spec_r = max(4, int(12 * abs(math.cos(angle))))
    d.ellipse([sx - spec_r, sy - spec_r, sx + spec_r, sy + spec_r],
              fill=lerp_color(RUBY_LITE, WHITE, 0.7))

    # --- rim-light streak on pendant ---
    streak_x = px + int((tdrop_w + 5) * math.cos(angle))
    for r in range(6, 0, -1):
        alpha_c = lerp_color(DARK_BG, GOLD_LITE, r / 6 * 0.8)
        d.ellipse([streak_x - r, py - r, streak_x + r, py + r], fill=alpha_c)

    # --- gold bail connector ---
    d.rectangle([cx - 8, cy - 20, cx + 8, cy - 5], fill=GOLD)

    # --- subtle vignette ---
    vig = Image.new('RGB', (W, H), DARK_BG)
    for r in range(W // 2, 0, -20):
        a = int(160 * (r / (W // 2)) ** 2)
        c = lerp_color(DARK_BG, (0, 0, 0), 1 - r / (W // 2))
    img = Image.blend(img, vig, 0.15)

    return img.filter(ImageFilter.GaussianBlur(radius=0.4))


def make_reveal_frame(i):
    """Gemstone components scatter then assemble at center."""
    img = Image.new('RGB', (W, H), DARK_BG)
    d   = ImageDraw.Draw(img)
    t   = i / (N - 1)           # 0→1: scattered→assembled

    cx, cy = W // 2, H // 2

    # particles: 12 facets scatter outward then collapse in
    n_facets = 12
    for k in range(n_facets):
        base_angle = (k / n_facets) * 2 * math.pi
        # at t=0 they're spread; at t=1 they're all at center
        max_dist = 340 * (1 - t) ** 1.6
        dist = max_dist + 10 * math.sin(t * math.pi * 3 + k)
        fx = cx + int(dist * math.cos(base_angle))
        fy = cy + int(dist * math.sin(base_angle) * 0.7)

        facet_size = int(14 + 22 * t + 8 * math.sin(t * math.pi + k))
        brightness = t * 0.8 + 0.2
        if k % 3 == 0:
            color = lerp_color(DARK_BG, RUBY_LITE, brightness)
        elif k % 3 == 1:
            color = lerp_color(DARK_BG, GOLD_LITE, brightness)
        else:
            color = lerp_color(DARK_BG, WHITE, brightness * 0.9)

        pts = []
        for corner in range(6):
            ca = base_angle + corner * math.pi / 3
            pts.append((fx + int(facet_size * math.cos(ca)),
                         fy + int(facet_size * math.sin(ca))))
        if len(pts) >= 3:
            d.polygon(pts, fill=color)

    # assembled pendant at center grows in
    pendant_scale = max(0.0, (t - 0.5) * 2)       # appears in second half
    if pendant_scale > 0:
        pw = int(70 * pendant_scale)
        ph = int(110 * pendant_scale)
        d.ellipse([cx - pw, cy - ph//2, cx + pw, cy + ph//2], fill=RUBY)
        # glint
        gx = cx - pw // 3
        gy = cy - ph // 4
        gr = max(1, int(10 * pendant_scale))
        d.ellipse([gx - gr, gy - gr, gx + gr, gy + gr],
                  fill=lerp_color(RUBY_LITE, WHITE, 0.8))
        # gold setting top
        if pendant_scale > 0.6:
            sw = int(20 * pendant_scale)
            d.rectangle([cx - sw//2, cy - ph//2 - 18,
                          cx + sw//2, cy - ph//2], fill=GOLD)

    # central radial glow at assembly
    glow_r = int(200 * t)
    for r in range(glow_r, 0, -12):
        alpha = t * 0.12 * (r / glow_r)
        c = lerp_color(DARK_BG, (200, 160, 50), alpha * 3)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)

    return img.filter(ImageFilter.GaussianBlur(radius=0.3))


def generate_section(name, fn, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    print(f"Generating {N} frames for [{name}]...")
    for i in range(N):
        frame = fn(i)
        path = os.path.join(out_dir, f"frame_{i:04d}.jpg")
        frame.save(path, 'JPEG', quality=88)
        if i % 30 == 0:
            print(f"  {i}/{N}")
    print(f"  Done → {out_dir}/")

generate_section("spin",   make_spin_frame,   "frames/spin")
generate_section("reveal", make_reveal_frame, "frames/reveal")
print("\nAll placeholder frames ready.")
print("Replace with Higgsfield-generated clips when auth is configured.")

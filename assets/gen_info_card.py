from PIL import Image, ImageDraw, ImageFont
import random
import os

# Seed for consistent, smooth drop patterns
random.seed(1337)

W, H = 880, 320
BLOCK = 8
COLS = W // BLOCK
ROWS = H // BLOCK
FRAMES = 24
DELAY = 75  # ~13 fps, smooth and lightweight

BG_COLOR = (9, 9, 15)  # #09090f deep space black
TEXT_WHITE = (255, 255, 255)
TEXT_PINK = (249, 168, 212)    # #f9a8d4
TEXT_ACCENT = (236, 72, 153)   # #ec4899
TEXT_MUTED = (167, 139, 250)   # #a78bfa soft violet
TEXT_GRAY = (140, 140, 165)
BORDER_COLOR = (236, 72, 153, 100) # subtle pink

# Colors for rain drops
HEAD_COLOR = (249, 168, 212)
TRAIL_COLORS = [
    (236, 72, 153),
    (190, 50, 130),
    (140, 30, 95),
    (90, 20, 65),
    (45, 10, 35)
]

# Set up raindrops
NUM_DROPS = 45
drops = []
for _ in range(NUM_DROPS):
    drops.append({
        'col': random.randint(0, COLS - 1),
        'start': random.randint(0, ROWS + 15),
        'speed': random.choice([0.75, 1.0, 1.25]),
        'length': random.randint(4, 9),
    })

# Load Fonts
FONT_DIR = 'C:/Windows/Fonts'
font_title = ImageFont.truetype(os.path.join(FONT_DIR, 'consolab.ttf'), 30)
font_subtitle = ImageFont.truetype(os.path.join(FONT_DIR, 'consolab.ttf'), 15)
font_code_bold = ImageFont.truetype(os.path.join(FONT_DIR, 'consolab.ttf'), 14)
font_code = ImageFont.truetype(os.path.join(FONT_DIR, 'consola.ttf'), 13)
font_small = ImageFont.truetype(os.path.join(FONT_DIR, 'consola.ttf'), 11)

frames = []

for f in range(FRAMES):
    # 1. Base background
    base = Image.new('RGBA', (W, H), BG_COLOR + (255,))
    draw_bg = ImageDraw.Draw(base)

    # 2. Draw pixel rain
    for d in drops:
        cycle = ROWS + d['length'] + 8
        head_row = (d['start'] + f * d['speed']) % cycle
        hr = int(head_row)

        if 0 <= hr < ROWS:
            x = d['col'] * BLOCK + 1
            y = hr * BLOCK + 1
            draw_bg.rectangle([x, y, x + BLOCK - 2, y + BLOCK - 2], fill=HEAD_COLOR)

        for ti in range(1, d['length'] + 1):
            r = hr - ti
            if 0 <= r < ROWS:
                c = TRAIL_COLORS[min(ti - 1, len(TRAIL_COLORS) - 1)]
                x = d['col'] * BLOCK + 1
                y = r * BLOCK + 1
                draw_bg.rectangle([x, y, x + BLOCK - 2, y + BLOCK - 2], fill=c)

    # 3. Overlay glassmorphism card for readable text
    card_overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw_card = ImageDraw.Draw(card_overlay)

    # Inner terminal card coords
    cx1, cy1, cx2, cy2 = 30, 20, W - 30, H - 20
    
    # Semi-transparent dark container so rain shows faintly behind text
    draw_card.rounded_rectangle([cx1, cy1, cx2, cy2], radius=14, fill=(12, 11, 20, 215), outline=(236, 72, 153, 140), width=1)

    # Terminal top bar
    draw_card.line([(cx1, cy1 + 34), (cx2, cy1 + 34)], fill=(236, 72, 153, 60), width=1)

    # Terminal dots
    draw_card.ellipse([cx1 + 16, cy1 + 12, cx1 + 26, cy1 + 22], fill=(236, 72, 153, 200))
    draw_card.ellipse([cx1 + 34, cy1 + 12, cx1 + 44, cy1 + 22], fill=(167, 139, 250, 200))
    draw_card.ellipse([cx1 + 52, cy1 + 12, cx1 + 62, cy1 + 22], fill=(249, 168, 212, 200))

    # Top title bar text
    draw_card.text((cx1 + 76, cy1 + 10), "hameem-bhai@cosmic-terminal:~", fill=TEXT_MUTED, font=font_small)

    # Blinking cursor / pulse tag in top right
    pulse_alpha = int(180 + 75 * ((f % 12) / 12.0 if (f // 12) % 2 == 0 else (12 - f % 12) / 12.0))
    draw_card.rounded_rectangle([cx2 - 110, cy1 + 8, cx2 - 16, cy1 + 26], radius=8, fill=(236, 72, 153, 40), outline=(236, 72, 153, pulse_alpha))
    draw_card.text((cx2 - 96, cy1 + 11), "● ONLINE", fill=TEXT_PINK, font=font_small)

    # Main Header: Name
    draw_card.text((cx1 + 30, cy1 + 50), "HAMEEM BHAI", fill=TEXT_WHITE, font=font_title)
    draw_card.text((cx1 + 31, cy1 + 51), "HAMEEM BHAI", fill=(249, 168, 212, 120), font=font_title)
    
    # Badge / Subtitle next to name or below
    draw_card.text((cx1 + 250, cy1 + 61), "/* BASIT HAMEEM */", fill=TEXT_MUTED, font=font_subtitle)

    # Accent divider under name
    draw_card.line([(cx1 + 30, cy1 + 92), (cx1 + 230, cy1 + 92)], fill=TEXT_ACCENT, width=2)
    draw_card.line([(cx1 + 235, cy1 + 92), (cx1 + 420, cy1 + 92)], fill=(167, 139, 250, 100), width=1)

    # Info lines
    cursor_char = "█" if (f // 6) % 2 == 0 else " "
    
    lines = [
        ("const education =", "Computer Network & Cyber Security @ AIUB", TEXT_PINK),
        ("const focus     =", "Web Development  ·  Cybersecurity  ·  AI Experiments", TEXT_WHITE),
        ("const motto     =", "\"Learn it. Build it. Make it better.\"", TEXT_MUTED),
        ("const mission   =", f"Turning ideas into reality, one commit at a time {cursor_char}", TEXT_PINK),
    ]

    curr_y = cy1 + 112
    for label, val, val_color in lines:
        draw_card.text((cx1 + 30, curr_y), label, fill=TEXT_ACCENT, font=font_code_bold)
        draw_card.text((cx1 + 195, curr_y), val, fill=val_color, font=font_code)
        curr_y += 28

    # Bottom status bar inside card
    draw_card.line([(cx1 + 30, cy2 - 38), (cx2 - 30, cy2 - 38)], fill=(236, 72, 153, 50), width=1)
    draw_card.text((cx1 + 30, cy2 - 28), "STATUS: active student & developer", fill=TEXT_GRAY, font=font_small)
    draw_card.text((cx2 - 230, cy2 - 28), "PORTFOLIO: hameembhai.me ↗", fill=TEXT_PINK, font=font_small)

    # Merge card overlay with base
    final_frame = Image.alpha_composite(base, card_overlay).convert('RGB')
    frames.append(final_frame)

out_path = 'assets/hameem-card.gif'
frames[0].save(
    out_path,
    save_all=True,
    append_images=frames[1:],
    loop=0,
    duration=DELAY,
    optimize=True,
)

size_kb = os.path.getsize(out_path) // 1024
print(f"Generated {out_path} ({FRAMES} frames, {size_kb} KB)")

"""
Generate High-Quality Space Game Icon for TRI-VERTEX
Creates a 1024x1024 master, downsamples with Lanczos to 512x512,
and exports icon.png and a multi-resolution icon.ico.
"""
import math
import random
from PIL import Image, ImageDraw, ImageFilter

def create_space_icon():
    # 2x supersampling: 1024x1024 -> downsample to 512x512
    W, H = 1024, 1024
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    # Layer 1: Badge Mask (Rounded Rectangle Squircle)
    margin = 48
    corner_r = 180
    badge_box = (margin, margin, W - margin, H - margin)

    # Base Background with Deep Space Cosmic Gradient
    bg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)

    # Draw rounded rectangle badge
    bg_draw.rounded_rectangle(badge_box, radius=corner_r, fill=(7, 9, 20, 255))

    # Add vertical/radial cosmic nebula gradients
    nebula = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    neb_draw = ImageDraw.Draw(nebula)

    # Cosmic Purple/Magenta Nebula in upper-left / center
    for r in range(380, 20, -20):
        alpha = int(18 * (1 - r / 380))
        neb_draw.ellipse((260 - r, 380 - r, 260 + r, 380 + r), fill=(138, 43, 226, alpha))

    # Electric Cyan/Teal Nebula in lower-right
    for r in range(420, 30, -20):
        alpha = int(22 * (1 - r / 420))
        neb_draw.ellipse((760 - r, 680 - r, 760 + r, 680 + r), fill=(0, 210, 255, alpha))

    # Deep Indigo Nebula in upper-right
    for r in range(350, 30, -20):
        alpha = int(20 * (1 - r / 350))
        neb_draw.ellipse((800 - r, 280 - r, 800 + r, 280 + r), fill=(30, 80, 220, alpha))

    nebula = nebula.filter(ImageFilter.GaussianBlur(radius=40))
    bg.alpha_composite(nebula)

    # Layer 2: Starfield
    stars = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    star_draw = ImageDraw.Draw(stars)

    # Deterministic seed for gorgeous star distribution
    rng = random.Random(42)

    # 180 small sparkling stars
    for _ in range(180):
        sx = rng.randint(margin + 20, W - margin - 20)
        sy = rng.randint(margin + 20, H - margin - 20)
        s_radius = rng.uniform(1.2, 3.2)
        s_alpha = rng.randint(90, 255)
        hue_choice = rng.random()
        if hue_choice < 0.6:
            s_color = (255, 255, 255, s_alpha)
        elif hue_choice < 0.85:
            s_color = (0, 240, 255, s_alpha)
        else:
            s_color = (255, 210, 120, s_alpha)
        star_draw.ellipse((sx - s_radius, sy - s_radius, sx + s_radius, sy + s_radius), fill=s_color)

    # 8 Major Cross-Flare Stars
    major_stars = [
        (180, 200, 18, (0, 240, 255)),
        (840, 220, 16, (255, 255, 255)),
        (190, 780, 14, (180, 100, 255)),
        (860, 760, 20, (0, 240, 255)),
        (320, 150, 12, (255, 255, 255)),
        (720, 160, 15, (0, 255, 200)),
        (150, 480, 13, (255, 255, 255)),
        (890, 490, 14, (0, 230, 255)),
    ]

    for sx, sy, size_f, col in major_stars:
        # Cross diffraction spikes
        flare_len = size_f * 2.8
        flare_w = max(1.5, size_f * 0.18)
        star_draw.line([(sx - flare_len, sy), (sx + flare_len, sy)], fill=col + (200,), width=int(flare_w))
        star_draw.line([(sx, sy - flare_len), (sx, sy + flare_len)], fill=col + (200,), width=int(flare_w))
        # Halo
        star_draw.ellipse((sx - size_f * 0.5, sy - size_f * 0.5, sx + size_f * 0.5, sy + size_f * 0.5), fill=(255, 255, 255, 240))

    bg.alpha_composite(stars)

    # Layer 3: Cybernetic Arena Orbital Ring (Background HUD)
    hud = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hud_draw = ImageDraw.Draw(hud)
    cx, cy = W // 2, H // 2 + 30
    ring_r = 290

    # Glowing outer segmented orbit
    hud_draw.ellipse((cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r), outline=(0, 240, 255, 60), width=3)
    # Inner dashed ring
    for deg in range(0, 360, 15):
        if (deg // 15) % 2 == 0:
            a_start = math.radians(deg)
            a_end = math.radians(deg + 9)
            x1 = cx + math.cos(a_start) * (ring_r - 28)
            y1 = cy + math.sin(a_start) * (ring_r - 28)
            x2 = cx + math.cos(a_end) * (ring_r - 28)
            y2 = cy + math.sin(a_end) * (ring_r - 28)
            hud_draw.line([(x1, y1), (x2, y2)], fill=(0, 240, 255, 45), width=2)

    bg.alpha_composite(hud)

    # Layer 4: Thruster Plasma Exhaust Flames (Behind Ship)
    exhaust = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ex_draw = ImageDraw.Draw(exhaust)

    # Left and Right Thruster Plumes
    thruster_positions = [(cx - 68, cy + 185), (cx + 68, cy + 185)]
    for tx, ty in thruster_positions:
        # Long outer cyan flame
        flame_len = 210
        f_pts = [
            (tx - 26, ty),
            (tx + 26, ty),
            (tx + 18, ty + flame_len * 0.4),
            (tx, ty + flame_len),
            (tx - 18, ty + flame_len * 0.4)
        ]
        ex_draw.polygon(f_pts, fill=(0, 240, 255, 120))

        # Mid electric blue flame
        f_pts_mid = [
            (tx - 18, ty),
            (tx + 18, ty),
            (tx + 11, ty + flame_len * 0.35),
            (tx, ty + flame_len * 0.72),
            (tx - 11, ty + flame_len * 0.35)
        ]
        ex_draw.polygon(f_pts_mid, fill=(0, 160, 255, 190))

        # Hot white/cyan core flame
        f_pts_core = [
            (tx - 10, ty),
            (tx + 10, ty),
            (tx + 6, ty + flame_len * 0.22),
            (tx, ty + flame_len * 0.45),
            (tx - 6, ty + flame_len * 0.22)
        ]
        ex_draw.polygon(f_pts_core, fill=(255, 255, 255, 255))

    # Glow blur on exhaust
    exhaust_glow = exhaust.filter(ImageFilter.GaussianBlur(radius=14))
    bg.alpha_composite(exhaust_glow)
    bg.alpha_composite(exhaust)

    # Layer 5: The Iconic Tri-Vertex Starfighter Ship
    ship = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ship_draw = ImageDraw.Draw(ship)

    # Starfighter Geometry (Apex at top center)
    apex = (cx, cy - 250)
    left_wingtip = (cx - 195, cy + 185)
    right_wingtip = (cx + 195, cy + 185)
    aft_center = (cx, cy + 115)

    # Outer Glow / Energy Shield Hull Aura
    hull_outer = [apex, right_wingtip, aft_center, left_wingtip]
    hull_glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hg_draw = ImageDraw.Draw(hull_glow)
    hg_draw.polygon(hull_outer, fill=(0, 240, 255, 80), outline=(0, 240, 255, 220))
    hull_glow = hull_glow.filter(ImageFilter.GaussianBlur(radius=18))
    bg.alpha_composite(hull_glow)

    # Primary Hull (Cyber Gunmetal Navy)
    ship_draw.polygon(hull_outer, fill=(14, 21, 38, 255), outline=(0, 240, 255, 255))

    # Inner Wing Plates (Faceted Aerodynamic Armor)
    # Left facet
    left_facet = [apex, aft_center, left_wingtip]
    ship_draw.polygon(left_facet, fill=(18, 28, 52, 255))
    # Right facet
    right_facet = [apex, right_wingtip, aft_center]
    ship_draw.polygon(right_facet, fill=(24, 38, 70, 255))

    # Glowing Neon Energy Conduits / Wing Edges
    edge_w = 6
    ship_draw.line([apex, left_wingtip], fill=(0, 240, 255, 255), width=edge_w)
    ship_draw.line([apex, right_wingtip], fill=(0, 240, 255, 255), width=edge_w)
    ship_draw.line([left_wingtip, (cx - 70, cy + 185), aft_center], fill=(0, 240, 255, 220), width=4)
    ship_draw.line([right_wingtip, (cx + 70, cy + 185), aft_center], fill=(0, 240, 255, 220), width=4)

    # Center Spine
    ship_draw.line([apex, aft_center], fill=(80, 255, 255, 230), width=4)

    # Secondary Energy Channels (Chevron Insets)
    for k, dy in [(0.4, 0), (0.65, 0)]:
        lx = apex[0] + (left_wingtip[0] - apex[0]) * k
        ly = apex[1] + (left_wingtip[1] - apex[1]) * k
        rx = apex[0] + (right_wingtip[0] - apex[0]) * k
        ry = apex[1] + (right_wingtip[1] - apex[1]) * k
        mid_y = apex[1] + (aft_center[1] - apex[1]) * k + 22
        ship_draw.line([(lx, ly), (cx, mid_y), (rx, ry)], fill=(0, 240, 255, 180), width=3)

    # Cockpit / Apex Fusion Core (Blazing Cyan/White Diamond)
    core_top = cy - 40
    core_h = 75
    core_w = 34
    core_pts = [
        (cx, core_top - core_h // 2),
        (cx + core_w // 2, core_top),
        (cx, core_top + core_h // 2),
        (cx - core_w // 2, core_top)
    ]
    ship_draw.polygon(core_pts, fill=(255, 255, 255, 255), outline=(0, 240, 255, 255))

    # Thruster Nacelle Cowlings
    for tx, ty in [(cx - 68, cy + 185), (cx + 68, cy + 185)]:
        ship_draw.rounded_rectangle((tx - 18, ty - 12, tx + 18, ty + 4), radius=4, fill=(40, 55, 85, 255), outline=(0, 240, 255, 255), width=2)
        ship_draw.ellipse((tx - 12, ty - 4, tx + 12, ty + 6), fill=(255, 255, 255, 255))

    bg.alpha_composite(ship)

    # Layer 6: Cybernetic Badge Border & Glow Rim
    rim = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)

    # Outer Neon Cyan Cyber Rim
    rim_draw.rounded_rectangle(badge_box, radius=corner_r, outline=(0, 240, 255, 230), width=6)
    # Inner subtle highlight
    inner_box = (margin + 6, margin + 6, W - margin - 6, H - margin - 6)
    rim_draw.rounded_rectangle(inner_box, radius=corner_r - 4, outline=(255, 255, 255, 70), width=2)

    # Corner cyber tick brackets on badge
    bracket_len = 45
    b_color = (0, 240, 255, 255)
    bw = 5
    # Top-Left
    rim_draw.line([(margin, margin + 80), (margin, margin + 80 - bracket_len)], fill=b_color, width=bw)
    rim_draw.line([(margin + 80, margin), (margin + 80 - bracket_len, margin)], fill=b_color, width=bw)
    # Top-Right
    rim_draw.line([(W - margin, margin + 80), (W - margin, margin + 80 - bracket_len)], fill=b_color, width=bw)
    rim_draw.line([(W - margin - 80, margin), (W - margin - 80 + bracket_len, margin)], fill=b_color, width=bw)

    bg.alpha_composite(rim)

    # Mask everything neatly inside the rounded squircle badge so corners are transparent
    mask = Image.new('L', (W, H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(badge_box, radius=corner_r, fill=255)

    final_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    final_img.paste(bg, (0, 0), mask=mask)

    # Downsample with high-fidelity Lanczos resampling to 512x512
    icon_512 = final_img.resize((512, 512), Image.Resampling.LANCZOS)

    # Save 512x512 master PNG
    icon_png_path = r'd:\Leytens Game\icon.png'
    icon_512.save(icon_png_path, 'PNG', optimize=True)
    print(f'Saved master icon to {icon_png_path}')

    # Save Windows multi-resolution ICO (256, 128, 64, 48, 32, 16)
    icon_ico_path = r'd:\Leytens Game\icon.ico'
    icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    icon_512.save(icon_ico_path, format='ICO', sizes=icon_sizes)
    print(f'Saved Windows multi-res icon to {icon_ico_path}')

if __name__ == '__main__':
    create_space_icon()

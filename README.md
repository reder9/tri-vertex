# TRI-VERTEX // Melee & Ranged Geometric Arena

A sleek, cyber-neon HTML5 canvas combat arena game where you pilot an agile combat Triangle armed with deep **Melee** and **Far-Range** arsenals, fluid movement mechanics, procedural Web Audio synthesis, and roguelike augmentations.

---

## Combat Controls

### Keyboard & Mouse

| Action | Control | Description |
| :--- | :--- | :--- |
| **Flight & Thrusters** | `[W] [A] [S] [D]` or `Arrows` | Directional inertia flight with twin plasma exhausts |
| **Aiming** | `[Mouse Move]` | Rotates triangle apex to aim weapons |
| **Primary Melee** | `[Left Mouse Button]` | Swings / thrusts currently equipped Melee weapon |
| **Far-Range Fire** | `[Right Mouse Button]` | Discharges equipped Far-Range weapon |
| **Phase Dash** | `[Spacebar]` | High-speed dash with invulnerability frames and ghost trails |
| **Cycle Melee Weapon** | `[1] [2] [3] [4]` or `[Q]` | Swaps equipped Melee weapon on the fly |
| **Cycle Far-Range Weapon**| `[5] [6] [7] [8]` or `[E]` | Swaps equipped Far-Range weapon on the fly |
| **Super Nova Ultimate** | `[F]` | Screen-clearing gravitational EMP shockwave (charges +4% per defeated enemy; 25 kills to prime) |
| **Pause / Resume** | `[ESC]` or `[P]` | Suspends simulation with realtime debrief |

### Xbox Controller (Virtual Cursor System)

| Action | Xbox Control | Description |
| :--- | :--- | :--- |
| **360° Flight & Drift** | `[Left Analog Stick]` / `[D-Pad]` | Proportional 360-degree analog thruster flight with speed sensitivity |
| **Virtual Cursor Aim** | `[Right Analog Stick]` | Sleek, line-free holographic cyber cursor (glowing ring & pip) with unobstructed battlefield vision |
| **Primary Melee Slash** | `[Right Trigger (RT / R2)]` or `[Button X]` | Swings / lunges equipped Melee weapon in cursor direction and parries enemy fire |
| **Far-Range Beam Fire** | `[Left Trigger (LT / L2)]` | Discharges Far-Range weapon directly at the cursor with trigger sensitivity |
| **Smart Aim Magnetism** | `Automatic on Aim / LT (L2)` | Soft aim-assist cone (26.4°, 750px) softly magnetizes shots onto hostile shapes |
| **Target Lock Telemetry**| `[  ] Corner Brackets` | Animated lock brackets frame acquired target with real-time HP readout and haptic tick |
| **Phase Dash** | `[Button A]` or `[Left Bumper (LB)]` | Fast invulnerable warp in current flight / stick direction |
| **Menu Cursor & Select**| `[Left/Right Stick] + [Button A / RT]` | Move virtual cursor over any UI button or upgrade card and click directly |
| **Cycle Melee Weapon** | `[Right Bumper (RB)]` | Cycles Melee arsenal (Katana, Lance, Hammer, Glaives) |
| **Cycle Far-Range Weapon**| `[Button B]` | Cycles Far-Range arsenal (Beam, Seekers, Repeater, Flak, Void) |
| **Super Nova Ultimate** | `[Button Y]` | Detonates full-screen gravitational blast (charges +4% per defeated enemy; 25 kills to prime) |
| **Pause / Menu / Start** | `[Menu / Start Button]` | Starts combat from title screen, or pauses/resumes simulation |
| **Toggle Audio Mute** | `[View / Back Button]` | Instantly toggles synthesized Web Audio sound |
| **Upgrade Card Navigation**| `[D-Pad Left/Right]` or `[Virtual Cursor]` | Seamlessly highlights and equips level-up augments |
| **Haptic Rumble Feedback** | `Dual-Rumble Actuators` | Dynamic haptic feedback on lock acquisition, heavy shots, slashes, dash, and damage |

---

### Phones & Tablets (Touch Twin-Stick)

| Action | Touch Control | Description |
| :--- | :--- | :--- |
| **360° Analog Thrusters** | [Left Virtual Stick] | Smooth 360-degree virtual analog flight stick with proportional speed sensitivity |
| **Precision Aim & Auto-Lock** | [Touch / Drag / Tap] | Automatic smart target acquisition prioritizes closest hostiles; drag from Fire button for manual 360° aiming |
| **Primary Melee Slash** | [Slash Button (Cyan)] | Primary melee attack and parry bullet deflection |
| **Far-Range Fire & Aim** | [Fire Button (Pink)] | Discharges active ranged weapon; drag thumb outward to manually steer your firing arc |
| **Phase Dash Warp** | [Dash Button (Amber)] | Invulnerable warp in current flight / joystick vector with ghost trails |
| **Super Nova Ultimate** | [Nova Button (Purple)] | Screen-clearing gravitational shockwave (charges +4% per defeated enemy, glows neon purple when fully primed at 100%) |
| **Quick Weapon Cycle** | [Weapon Pills] | Quick-swap buttons for Melee (Katana/Lance/Hammer/Glaives) and Ranged (Beam/Seekers/Repeater/Flak/Void) |
| **Touch Controls Toggle** | [Smartphone Icon Button]| Toggle touch overlay on/off anytime from the top action bar |
| **Sideways Widescreen Mode** | [Landscape Icon Button] | Locks/rotates display into 16:9 widescreen landscape matching PC arena dimensions |

---

## Weapons Arsenal

### Melee Weapons (Left Click)
1. **Cyber Katana**: Fast 150-degree arc slash. Deflects incoming enemy fire back at attackers as critical shards.
2. **Hyper Lance**: Piercing kinetic thrust forward. Lunges triangle into targets and deals 2.2x critical damage at the apex tip.
3. **Titan Smasher**: Heavy seismic cleave creating a 360-degree crushing shockwave with massive knockback.
4. **Orbiting Glaives**: Three razor-sharp energy triangles continuously orbit the ship to shred nearby enemies and bullets. Left-click overclocks radial blade velocity.

### Far-Range Weapons (Right Click)
1. **Pulse Beam (Railgun)**: Fires an instantaneous hyper-velocity particle beam that pierces through every enemy on screen. **Requires 15 Energy**.
2. **Swarm Seekers**: Launches a trio of agile micro-missiles from rear stabilizers that curve towards targets within their forward cone. Consumes 14 Energy.
3. **Tri-Repeater**: High-frequency rotary blaster discharging continuous sprays of coherent plasma bolts. Requires 3 Energy.
4. **Scatter Flak**: Kinetic shotgun blast spraying seven shrapnel pellets at close-to-medium range with controlled knockback. Requires 12 Energy.
5. **Void Vortex**: Fires a tactical gravity orb that creates a localized vortex, gently grouping enemies before detonating. Consumes 22 Energy.

---

## Energy & Combat Synergy Mechanics

- **100 Energy Capacity**: Your Triangle has a 100-point energy capacitor with live HUD monitoring.
- **Beam Energy Cost**: Firing the Pulse Beam expends **15 Energy**. If you have under 15 energy, a visual warning pops up.
- **Energy Regeneration & Siphon**: Energy passively recharges over time (+14 EN/sec) and **landing Melee strikes siphons +12 Energy per enemy struck**, rewarding seamless melee/ranged switching!
- **Melee hits build Overcharge**: Land melee strikes to charge the Synergy Meter. At 100%, your next Far-Range attack deals **200% damage** with an explosive blast!
- **Far-Range hits inflict Vulnerability**: Ranged hits weaken enemy hulls, making them take **+60% bonus Melee damage** and restoring your shields upon elimination.
- **Deflection & Parrying**: Melee slashes (Katana, Hammer, Glaives) can parry hostile enemy bullets back at them as friendly high-damage critical shots.
- **Lightning Arc Phase Dash (Legendary)**: Phase Dashing drops a continuous, crackling high-voltage electricity trail connecting zig-zag lightning arcs. Enemies who touch the trail suffer continuous electrocution damage (140 DPS), severe movement slow, and synergy vulnerability, while leaving behind a detonating decoy at the dash origin!
- **Colossus Octagon Boss (Sector 5 Balanced & Engaging)**: Tuned for thrilling combat across Xbox controllers and keyboard/mouse. Features 3100 HP, 8-way rotating bullet barrages (410 speed, 15 dmg), contact damage (26 dmg), a 50% HP armor fracture dropping 3 recovery gems, and a Phase 2 Overcharge enrage with 10-way barrages (430 speed, 16 dmg) and heightened agility.
- **Tiered Roguelike Power-Up Progression**: All power-ups are organized into structured, multi-tier progression trees (Tier 1 [Common] → Tier 2 [Uncommon] → Tier 3 [Rare] → Tier 4 [Epic] → Tier 5 [Legendary]).
  - **Sequential Progression**: You must progress through each power-up tree in order (e.g. Magnet Tier 1 → Tier 2 → Tier 3 → Tier 4 → Tier 5). You cannot skip straight to super-leveled or Legendary abilities right away.
  - **No Duplicate Re-Showing**: Once you select and equip an augment tier, it is permanently completed and will **never appear on the level-up screen again** during that round.
  - **Next-Tier Unlocking**: Acquiring a tier unlocks the next higher tier in that tree for future level-up drafts.
  - **9 Combat Power-Up Trees**:
    1. **Magnetic Harvester (5 Tiers)**: Ferrite Core (T1) → Neodymium Pulser (T2) → Quantum Field (T3) → Vortex Siphon (T4) → Singularity Harvester (T5).
    2. **Phase Dash Mobility (4 Tiers)**: Reflex Thrusters (T1) → Decoy Afterburner (T2) → Ion Scorch Trail (T3) → Lightning Arc Phase Shift (T4).
    3. **Kinetic Reach & Force (4 Tiers)**: Kinetic Reach (T1) → Plasma Edge (T2) → Vorpal Arc (T3) → Apex Blade Mastery (T4).
    4. **Parry & Siphon Defense (4 Tiers)**: Kinetic Deflector (T1) → Nanite Siphon (T2) → Aegis Counterpulse (T3) → Parry Overclock (T4).
    5. **Ranged Firepower (4 Tiers)**: High Caliber Drill (T1) → Overclocked Accelerators (T2) → Twin Barrel Matrix (T3) → Cluster Warhead (T4).
    6. **Thermal Laser (3 Tiers)**: Ion Ionization (T1) → Thermal Efficiency (T2) → Hyper Discharge (T3).
    7. **Aegis Shields (4 Tiers)**: Aegis Capacitor (T1) → Composite Plating (T2) → Kinetic Barrier (T3) → Bulwark Matrix (T4).
    8. **Energy Reactor (3 Tiers)**: Capacitor Booster (T1) → Plasma Reactor (T2) → Dark Matter Dynamo (T3).
    9. **Thruster Agility & Synergy (3 Tiers)**: Vectored Thrusters (T1) → Slipstream Overdrive (T2) → Resonance Driver (T3).

---

## How to Play

- **Live Web Game**: Play directly on GitHub Pages at [https://reder9.github.io/tri-vertex/](https://reder9.github.io/tri-vertex/)
- **Desktop Shortcut**: Double-click the **Tri-Vertex** shortcut on your Desktop (featuring the custom space fighter icon) to launch the game directly.
- **Manual Launch**: Open [`index.html`](file:///d:/Leytens%20Game/index.html) in any modern web browser (Google Chrome, Edge, Firefox, Brave, Safari) or serve with any static web server:

```bash
# Using Node npx serve:
npx serve .

# Or using Python:
python -m http.server 8080
```

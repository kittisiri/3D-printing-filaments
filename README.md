# 3D Printing Filament Color Explorer

A static website that displays every PLA and PETG color from **Bambu Lab** and **Polymaker Panchroma**, arranged by hue, with brand/type filters and a detail view showing HEX, HSL, LAB, and an auto-generated comparison to nearby hues.

No build step. Open `index.html` directly in a browser, or deploy by pushing this folder to GitHub Pages.

## Run locally

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new GitHub repo and push these files to it.
2. In the repo settings → Pages, choose "Deploy from a branch", select the branch and `/ (root)`.
3. After a minute the site is live at `https://<user>.github.io/<repo>/`.

## Files

```
index.html         Markup shell
styles.css         All styling (neutral grey theme)
color-utils.js     HEX → HSL / LAB / ΔE76 helpers
app.js             State, filtering, sort, render, drawer
data/colors.json   The filament dataset
```

## How to update the dataset

Each record in `data/colors.json` looks like:

```json
{
  "id": "bl-pla-basic-bambu-green",
  "brand": "Bambu Lab",
  "type": "PLA Basic",
  "name": "Bambu Green",
  "hex": "#00AE42",
  "finish": "solid"
}
```

For multi-stop filaments (Silk Dual, Dual Matte, etc.) add `"stops": ["#hex1", "#hex2"]`. For glow filaments add `"glowHex"`. For translucent filaments add `"translucent": true`. The app auto-computes hue, saturation, and LAB.

## Data sources & caveats

Hex codes are taken from:

- **Bambu Lab official Filament Hex Code PDFs** (store.bblcdn.com / .eu) for PLA Basic, PLA Matte, PLA-CF, PETG Basic, PETG-CF.
- **Bambu Lab product pages and authorized retailer listings** for PLA Silk+, PLA Sparkle, PLA Galaxy, PLA Glow, PLA Wood, PLA Marble, PLA Metal, PLA Translucent, PLA Tough+, PETG HF, PETG Translucent.
- **Polymaker Wiki: HEX Codes and Transmission Distances** for all Panchroma lines (Basic, Matte, Silk, Dual Silk, Dual Matte, Marble, Translucent, Neon, Metallic, Celestial, Starlight, Galaxy, Glow, Luminous, Satin, CoPE).

**Important caveats**:

- Manufacturer hex values are marketing approximations, not spectrophotometer measurements. Two filaments with identical published hex codes can still print noticeably different under real lighting.
- Silk, sparkle, metallic, marble, wood, and CF appearance differs from a flat hex swatch — the page shows the manufacturer's nominal color, not a print rendering.
- Glow filaments display the daytime color in the grid; the in-dark glow color is shown in the detail drawer.
- Translucent swatches are rendered with a striped overlay; the underlying hex is the published "as-printed" color.
- Polymaker Panchroma "CoPE" is a co-polyester (PETG-like) material; it's grouped under PETG variants for filtering purposes.

The dataset was compiled on **2026-05-13**. Manufacturer lineups change — see `data/colors.json` `lastVerified` field and update when checking.

## Description algorithm

For each color, the app picks the 4 nearest hue-band neighbors from the currently filtered set (ranked by ΔE76 in CIELAB). For each neighbor it emits a sentence describing the deltas:

- **hue**: warmer / cooler (toward 30° vs 210° on the hue circle)
- **saturation**: more saturated / more muted
- **lightness**: lighter / deeper

Neutral colors (saturation < 10%) are bucketed separately and compared by lightness alone, since hue is unstable in that range.

## License & attribution

Color hex data is published by Bambu Lab and Polymaker as part of their product information. Brand names, product names, and SKUs are trademarks of their respective owners. The code in this repo is yours to fork and modify.

/* Color math helpers. Exposes a `ColorUtils` global. */
(function (root) {
  "use strict";

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function hexToRgb(hex) {
    const m = String(hex).trim().replace(/^#/, "");
    const s = m.length === 3
      ? m.split("").map(c => c + c).join("")
      : m.padEnd(6, "0").slice(0, 6);
    const n = parseInt(s, 16);
    return {
      r: (n >> 16) & 0xff,
      g: (n >> 8) & 0xff,
      b: n & 0xff,
    };
  }

  function rgbToHex({ r, g, b }) {
    const h = v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
    return "#" + h(r) + h(g) + h(b);
  }

  function srgbToLinear(c) {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  function rgbToHsl({ r, g, b }) {
    const R = r / 255, G = g / 255, B = b / 255;
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case R: h = (G - B) / d + (G < B ? 6 : 0); break;
        case G: h = (B - R) / d + 2; break;
        case B: h = (R - G) / d + 4; break;
      }
      h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
  }

  /* sRGB → linear → XYZ (D65) → CIELAB */
  function rgbToLab({ r, g, b }) {
    const R = srgbToLinear(r);
    const G = srgbToLinear(g);
    const B = srgbToLinear(b);
    // sRGB D65 matrix
    const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
    const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
    const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
    // Reference white D65
    const Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
    const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
    const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
    return {
      L: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
    };
  }

  function deltaE76(a, b) {
    const dL = a.L - b.L, da = a.a - b.a, db = a.b - b.b;
    return Math.sqrt(dL * dL + da * da + db * db);
  }

  /* Signed shortest hue distance from h1 to h2 (degrees, -180..180). */
  function hueDistance(h1, h2) {
    let d = h2 - h1;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  /* Decide whether a color should be treated as a neutral (low saturation). */
  function isNeutral(hsl) {
    return hsl.s < 10;
  }

  /* Compute and attach hsl/lab to a record using its display hex. */
  function decorate(record) {
    const rgb = hexToRgb(record.hex);
    record.rgb = rgb;
    record.hsl = rgbToHsl(rgb);
    record.lab = rgbToLab(rgb);
    if (Array.isArray(record.stops)) {
      record.stopColors = record.stops.map(h => {
        const sr = hexToRgb(h);
        return { hex: h, rgb: sr, hsl: rgbToHsl(sr), lab: rgbToLab(sr) };
      });
    }
    if (record.glowHex) {
      const gr = hexToRgb(record.glowHex);
      record.glowColor = { hex: record.glowHex, rgb: gr, hsl: rgbToHsl(gr), lab: rgbToLab(gr) };
    }
    return record;
  }

  /* Stable hue-sort: neutrals at the end, sorted by lightness; chromatic by hue then L. */
  function sortByHue(records) {
    return records.slice().sort((a, b) => {
      const an = isNeutral(a.hsl), bn = isNeutral(b.hsl);
      if (an && !bn) return 1;
      if (!an && bn) return -1;
      if (an && bn) return a.hsl.l - b.hsl.l;
      const dh = a.hsl.h - b.hsl.h;
      if (Math.abs(dh) > 0.001) return dh;
      return a.hsl.l - b.hsl.l;
    });
  }

  /* Find nearest neighbors in a pool (sorted by ΔE76), filtered by hue band for chromatic. */
  function findNeighbors(target, pool, count) {
    count = count || 2;
    const others = pool.filter(p => p.id !== target.id);
    if (isNeutral(target.hsl)) {
      const neutrals = others.filter(p => isNeutral(p.hsl));
      return neutrals
        .map(p => ({ rec: p, d: Math.abs(p.hsl.l - target.hsl.l) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, count)
        .map(x => x.rec);
    }
    const band = others.filter(p =>
      !isNeutral(p.hsl) && Math.abs(hueDistance(target.hsl.h, p.hsl.h)) <= 40
    );
    const candidates = band.length >= count ? band : others.filter(p => !isNeutral(p.hsl));
    return candidates
      .map(p => ({ rec: p, d: deltaE76(target.lab, p.lab) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, count)
      .map(x => x.rec);
  }

  /* Generate a sentence describing how target relates to one neighbor. */
  function describeRelation(target, neighbor) {
    const comparatives = []; // entries that pair naturally with "than"
    let shiftPhrase = null;   // entries like "shifted toward red" — pair with "compared to"

    const dh = hueDistance(neighbor.hsl.h, target.hsl.h); // positive: target is "later" in hue circle
    const ds = target.hsl.s - neighbor.hsl.s;
    const dl = target.hsl.l - neighbor.hsl.l;

    if (!isNeutral(target.hsl) && !isNeutral(neighbor.hsl) && Math.abs(dh) > 4) {
      const tWarmth = warmthScore(target.hsl.h);
      const nWarmth = warmthScore(neighbor.hsl.h);
      if (tWarmth > nWarmth + 0.05) comparatives.push("warmer");
      else if (tWarmth < nWarmth - 0.05) comparatives.push("cooler");
      else shiftPhrase = dh > 0 ? "shifted toward yellow" : "shifted toward red";
    }
    if (Math.abs(ds) > 8) comparatives.push(ds > 0 ? "more saturated" : "more muted");
    if (Math.abs(dl) > 8) comparatives.push(dl > 0 ? "lighter" : "deeper");

    const label = neighborLabel(neighbor);

    if (comparatives.length === 0 && !shiftPhrase) {
      const dE = deltaE76(target.lab, neighbor.lab);
      if (dE < 4) return `Visually very close to ${label}.`;
      return `Subtly different from ${label}.`;
    }

    if (comparatives.length > 0 && shiftPhrase) {
      return `${capitalize(joinParts(comparatives))} than ${label}, and ${shiftPhrase} compared to it.`;
    }
    if (shiftPhrase) {
      return `${capitalize(shiftPhrase)} compared to ${label}.`;
    }
    return `${capitalize(joinParts(comparatives))} than ${label}.`;
  }

  /* 1.0 = pure warm (around orange), 0.0 = pure cool (around blue). */
  function warmthScore(h) {
    // Distance from 30° (warm pole) vs 210° (cool pole) on the hue circle.
    const dWarm = Math.min(Math.abs(h - 30), 360 - Math.abs(h - 30));
    const dCool = Math.min(Math.abs(h - 210), 360 - Math.abs(h - 210));
    return dCool / (dWarm + dCool);
  }

  function neighborLabel(n) {
    return `${n.name} (${n.brand}, ${n.type})`;
  }

  function joinParts(parts) {
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] + " and " + parts[1];
    return parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* Pick a readable text color (black or white) for an arbitrary hex background. */
  function readableTextOn(hex) {
    const { r, g, b } = hexToRgb(hex);
    // WCAG relative luminance
    const L = 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
    return L > 0.5 ? "#000" : "#fff";
  }

  root.ColorUtils = {
    hexToRgb, rgbToHex, rgbToHsl, rgbToLab, deltaE76, hueDistance,
    isNeutral, decorate, sortByHue, findNeighbors, describeRelation,
    neighborLabel, readableTextOn,
  };
})(window);

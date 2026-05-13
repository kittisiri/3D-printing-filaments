(function () {
  "use strict";
  const CU = window.ColorUtils;

  /* --- State --- */
  const state = {
    filaments: [],
    brands: [],            // unique brands
    types: [],             // unique types
    typesByCategory: { PLA: [], PETG: [] },
    selectedBrands: new Set(),
    selectedTypes: new Set(),
    sortMode: "hue",       // "hue" | "brand"
    search: "",
    activeId: null,
  };

  /* --- Init --- */
  fetch("data/colors.json", { cache: "no-cache" })
    .then(r => r.json())
    .then(json => {
      state.filaments = json.filaments.map(CU.decorate);
      indexMetadata();
      buildFilters();
      bindEvents();
      render();
    })
    .catch(err => {
      console.error(err);
      document.getElementById("result-count").textContent = "Failed to load colors.json";
    });

  function indexMetadata() {
    const brands = new Set(), types = new Set();
    const plaTypes = new Set(), petgTypes = new Set();
    for (const f of state.filaments) {
      brands.add(f.brand);
      types.add(f.type);
      if (/^pla|panchroma/i.test(f.type) || f.type.startsWith("PLA") || /pla/i.test(f.type)) {
        if (!isPetgType(f.type)) plaTypes.add(f.type);
      }
      if (isPetgType(f.type)) petgTypes.add(f.type);
    }
    state.brands = Array.from(brands).sort();
    state.types = Array.from(types).sort();
    state.typesByCategory.PLA = Array.from(plaTypes).sort();
    state.typesByCategory.PETG = Array.from(petgTypes).sort();
    state.selectedBrands = new Set(state.brands);
    state.selectedTypes = new Set(state.types);
  }

  function isPetgType(t) {
    return /petg|cope/i.test(t);
  }

  /* --- Filters UI --- */
  function buildFilters() {
    const brandList = document.getElementById("brand-filters");
    brandList.innerHTML = "";
    state.brands.forEach(brand => {
      const count = state.filaments.filter(f => f.brand === brand).length;
      brandList.appendChild(makeCheckbox({
        label: brand, count, checked: true,
        onChange: e => {
          if (e.target.checked) state.selectedBrands.add(brand);
          else state.selectedBrands.delete(brand);
          render();
        },
      }));
    });
    fillTypeList("pla-filters", state.typesByCategory.PLA);
    fillTypeList("petg-filters", state.typesByCategory.PETG);
  }

  function fillTypeList(elemId, types) {
    const list = document.getElementById(elemId);
    list.innerHTML = "";
    types.forEach(t => {
      const count = state.filaments.filter(f => f.type === t).length;
      list.appendChild(makeCheckbox({
        label: t, count, checked: true,
        onChange: e => {
          if (e.target.checked) state.selectedTypes.add(t);
          else state.selectedTypes.delete(t);
          render();
        },
      }));
    });
  }

  function makeCheckbox({ label, count, checked, onChange }) {
    const li = document.createElement("li");
    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = checked;
    cb.addEventListener("change", onChange);
    const span = document.createElement("span");
    span.textContent = label;
    const num = document.createElement("span");
    num.className = "count";
    num.textContent = count;
    lab.append(cb, span, num);
    li.appendChild(lab);
    return li;
  }

  /* --- Events --- */
  function bindEvents() {
    // Sort toggle
    document.querySelectorAll(".sort-toggle button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sort-toggle button").forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-checked", "true");
        state.sortMode = btn.dataset.sort;
        render();
      });
    });

    document.getElementById("search").addEventListener("input", e => {
      state.search = e.target.value.trim().toLowerCase();
      render();
    });

    document.getElementById("reset-filters").addEventListener("click", () => {
      state.selectedBrands = new Set(state.brands);
      state.selectedTypes = new Set(state.types);
      state.search = "";
      document.getElementById("search").value = "";
      buildFilters();
      render();
    });

    // Filter sidebar toggle (mobile)
    const sidebar = document.getElementById("sidebar");
    const filterToggle = document.getElementById("filter-toggle");
    filterToggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Drawer close
    document.getElementById("drawer-close").addEventListener("click", closeDrawer);
    document.getElementById("drawer-scrim").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  /* --- Filtering / sorting --- */
  function filtered() {
    return state.filaments.filter(f => {
      if (!state.selectedBrands.has(f.brand)) return false;
      if (!state.selectedTypes.has(f.type)) return false;
      if (state.search && !f.name.toLowerCase().includes(state.search) &&
          !f.type.toLowerCase().includes(state.search) &&
          !f.brand.toLowerCase().includes(state.search)) return false;
      return true;
    });
  }

  /* --- Render --- */
  function render() {
    const items = filtered();
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    const empty = document.getElementById("empty");

    document.getElementById("result-count").textContent =
      `${items.length} of ${state.filaments.length} filaments`;

    if (items.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    if (state.sortMode === "brand") {
      // Group by brand, sort within
      const byBrand = new Map();
      for (const f of items) {
        if (!byBrand.has(f.brand)) byBrand.set(f.brand, []);
        byBrand.get(f.brand).push(f);
      }
      const orderedBrands = Array.from(byBrand.keys()).sort();
      orderedBrands.forEach(brand => {
        const heading = document.createElement("div");
        heading.className = "grid-section-heading";
        heading.textContent = brand;
        grid.appendChild(heading);
        const sorted = CU.sortByHue(byBrand.get(brand));
        sorted.forEach(f => grid.appendChild(makeTile(f)));
      });
    } else {
      const sorted = CU.sortByHue(items);
      sorted.forEach(f => grid.appendChild(makeTile(f)));
    }
  }

  function swatchStyle(rec) {
    if (Array.isArray(rec.stops) && rec.stops.length > 1) {
      return `background: linear-gradient(135deg, ${rec.stops.join(", ")});`;
    }
    return `background: ${rec.hex};`;
  }

  function makeTile(rec) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile";
    btn.setAttribute("role", "listitem");
    if (rec.id === state.activeId) btn.classList.add("active");

    const sw = document.createElement("div");
    sw.className = "swatch";
    if (rec.translucent) sw.classList.add("translucent");
    sw.setAttribute("style", swatchStyle(rec));

    const finishBadge = badgeFor(rec);
    if (finishBadge) sw.appendChild(finishBadge);

    const name = document.createElement("div");
    name.className = "tile-name";
    name.textContent = rec.name;
    name.title = rec.name;

    const meta = document.createElement("div");
    meta.className = "tile-meta";
    const brand = document.createElement("span");
    brand.className = "brand";
    brand.textContent = rec.brand === "Bambu Lab" ? "Bambu" : "Polymaker";
    const type = document.createElement("span");
    type.className = "type";
    type.textContent = shortenType(rec.type);
    type.title = rec.type;
    meta.append(brand, type);

    btn.append(sw, name, meta);
    btn.addEventListener("click", () => openDrawer(rec));
    return btn;
  }

  function shortenType(t) {
    return t.replace(/^Panchroma\s+/, "").replace(/\sPLA$/, "").replace(/\s\(PETG-alt\)/, "");
  }

  function badgeFor(rec) {
    let label = null;
    switch (rec.finish) {
      case "silk": label = "silk"; break;
      case "silk-multi": label = "silk"; break;
      case "matte-multi": label = "dual"; break;
      case "cf": label = "CF"; break;
      case "wood": label = "wood"; break;
      case "marble": label = "marble"; break;
      case "galaxy": label = "galaxy"; break;
      case "sparkle": label = "sparkle"; break;
      case "metal": label = "metallic"; break;
      case "glow": label = "glow"; break;
      case "translucent": label = "translucent"; break;
    }
    if (!label) return null;
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = label;
    return b;
  }

  /* --- Drawer / detail --- */
  function openDrawer(rec) {
    state.activeId = rec.id;
    document.querySelectorAll(".tile").forEach(t => t.classList.remove("active"));
    const drawer = document.getElementById("drawer");
    const scrim = document.getElementById("drawer-scrim");
    drawer.setAttribute("aria-hidden", "false");
    drawer.classList.add("open");
    scrim.hidden = false;

    const content = document.getElementById("drawer-content");
    content.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = rec.name;
    content.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "brand-type";
    subtitle.textContent = `${rec.brand} · ${rec.type}`;
    content.appendChild(subtitle);

    const big = document.createElement("div");
    big.className = "big-swatch";
    if (rec.translucent) big.classList.add("translucent");
    big.setAttribute("style", swatchStyle(rec));
    content.appendChild(big);

    // Metadata table
    const table = document.createElement("table");
    table.className = "metadata-table";
    const rows = [
      ["HEX", rec.hex.toUpperCase()],
      ["Hue", `${rec.hsl.h.toFixed(0)}°`],
      ["Saturation", `${rec.hsl.s.toFixed(0)}%`],
      ["Lightness", `${rec.hsl.l.toFixed(0)}%`],
      ["LAB", `L* ${rec.lab.L.toFixed(1)}  a* ${rec.lab.a.toFixed(1)}  b* ${rec.lab.b.toFixed(1)}`],
      ["Finish", rec.finish || "solid"],
    ];
    rows.forEach(([k, v]) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th"); th.textContent = k;
      const td = document.createElement("td"); td.textContent = v;
      tr.append(th, td);
      table.appendChild(tr);
    });
    content.appendChild(table);

    // Stops (multi-color filaments)
    if (Array.isArray(rec.stopColors) && rec.stopColors.length > 1) {
      content.appendChild(sectionLabel("Color stops"));
      const ul = document.createElement("ul");
      ul.className = "stops-list";
      rec.stopColors.forEach(sc => {
        const li = document.createElement("li");
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.style.background = sc.hex;
        li.appendChild(chip);
        const txt = document.createElement("span");
        txt.textContent = `${sc.hex.toUpperCase()}  ·  H ${sc.hsl.h.toFixed(0)}°  S ${sc.hsl.s.toFixed(0)}%  L ${sc.hsl.l.toFixed(0)}%`;
        li.appendChild(txt);
        ul.appendChild(li);
      });
      content.appendChild(ul);
    }

    // Glow (daytime + glow color)
    if (rec.glowColor) {
      content.appendChild(sectionLabel("Glow color (in dark)"));
      const row = document.createElement("div");
      row.className = "glow-row";
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.style.background = rec.glowColor.hex;
      row.appendChild(chip);
      const txt = document.createElement("span");
      txt.textContent = `${rec.glowColor.hex.toUpperCase()}  ·  H ${rec.glowColor.hsl.h.toFixed(0)}°  L ${rec.glowColor.hsl.l.toFixed(0)}%`;
      row.appendChild(txt);
      content.appendChild(row);
    }

    // Neighbors / description
    const pool = filtered();
    const neighbors = CU.findNeighbors(rec, pool, 4);
    if (neighbors.length > 0) {
      content.appendChild(sectionLabel("Compared to its hue neighbors"));
      const wrap = document.createElement("div");
      wrap.className = "neighbors";
      neighbors.forEach(n => {
        const node = document.createElement("div");
        node.className = "neighbor";
        node.tabIndex = 0;
        node.setAttribute("role", "button");
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.setAttribute("style", swatchStyle(n));
        const txt = document.createElement("div");
        txt.className = "neighbor-text";
        const sentence = CU.describeRelation(rec, n);
        txt.innerHTML =
          `<div>${escapeHtml(sentence)}</div>
           <div class="neighbor-meta">${escapeHtml(n.name)} · ${escapeHtml(n.brand)} · ${escapeHtml(n.type)} · ${n.hex.toUpperCase()}</div>`;
        node.append(chip, txt);
        const goto = () => openDrawer(n);
        node.addEventListener("click", goto);
        node.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goto(); }
        });
        wrap.appendChild(node);
      });
      content.appendChild(wrap);
    }

    // Highlight active tile after re-render
    document.querySelectorAll(".tile").forEach(t => t.classList.remove("active"));
    const activeBtn = Array.from(document.querySelectorAll(".tile")).find(b =>
      b.querySelector(".tile-name") && b.querySelector(".tile-name").textContent === rec.name &&
      b.querySelector(".tile-meta .type") && b.querySelector(".tile-meta .type").title === rec.type
    );
    if (activeBtn) activeBtn.classList.add("active");
  }

  function sectionLabel(text) {
    const h = document.createElement("p");
    h.className = "section-label";
    h.textContent = text;
    return h;
  }

  function closeDrawer() {
    state.activeId = null;
    document.getElementById("drawer").classList.remove("open");
    document.getElementById("drawer").setAttribute("aria-hidden", "true");
    document.getElementById("drawer-scrim").hidden = true;
    document.querySelectorAll(".tile").forEach(t => t.classList.remove("active"));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }
})();

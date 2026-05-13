(function () {
  "use strict";
  const CU = window.ColorUtils;

  /* Official store page for each filament type. Falls back to brand collection page. */
  const TYPE_STORE_URL = {
    // Bambu Lab — us.store.bambulab.com/products/<slug>
    "PLA Basic":            "https://us.store.bambulab.com/products/pla-basic-filament",
    "PLA Matte":            "https://us.store.bambulab.com/products/pla-matte",
    "PLA Silk+":            "https://us.store.bambulab.com/products/pla-silk-upgrade",
    "PLA Silk Multi-Color": "https://us.store.bambulab.com/products/pla-silk-multi-color",
    "PLA-CF":               "https://us.store.bambulab.com/products/pla-cf",
    "PLA Wood":             "https://us.store.bambulab.com/products/pla-wood",
    "PLA Marble":           "https://us.store.bambulab.com/products/pla-marble",
    "PLA Galaxy":           "https://us.store.bambulab.com/products/pla-galaxy",
    "PLA Glow":             "https://us.store.bambulab.com/products/pla-glow",
    "PLA Sparkle":          "https://us.store.bambulab.com/products/pla-sparkle",
    "PLA Metal":            "https://us.store.bambulab.com/products/pla-metal",
    "PLA Translucent":      "https://us.store.bambulab.com/products/pla-translucent",
    "PLA Tough+":           "https://us.store.bambulab.com/products/pla-tough-upgrade",
    "PETG Basic":           "https://us.store.bambulab.com/products/petg-basic",
    "PETG HF":              "https://us.store.bambulab.com/products/petg-hf",
    "PETG-CF":              "https://us.store.bambulab.com/products/petg-cf",
    "PETG Translucent":     "https://us.store.bambulab.com/products/petg-translucent",
    // Polymaker Panchroma — shop.polymaker.com/products/<slug>
    "Panchroma Basic PLA":               "https://shop.polymaker.com/products/panchroma-pla",
    "Panchroma Matte PLA":               "https://shop.polymaker.com/products/panchroma-matte",
    "Panchroma Silk PLA":                "https://shop.polymaker.com/products/panchroma-silk",
    "Panchroma Satin PLA":               "https://shop.polymaker.com/products/panchroma-satin",
    "Panchroma Neon PLA":                "https://shop.polymaker.com/products/panchroma-neon",
    "Panchroma Luminous PLA":            "https://shop.polymaker.com/products/panchroma-luminous",
    "Panchroma Starlight PLA":           "https://shop.polymaker.com/products/panchroma-starlight",
    "Panchroma Celestial PLA":           "https://shop.polymaker.com/products/panchroma-celestial",
    "Panchroma Galaxy PLA":              "https://shop.polymaker.com/products/panchroma-galaxy",
    "Panchroma Glow PLA":                "https://shop.polymaker.com/products/panchroma-glow",
    "Panchroma Marble PLA":              "https://shop.polymaker.com/products/panchroma-marble",
    "Panchroma Metallic PLA":            "https://shop.polymaker.com/products/panchroma-metallic-pla",
    "Panchroma Translucent PLA":         "https://shop.polymaker.com/products/panchroma-translucent",
    "Panchroma Dual Silk PLA":           "https://shop.polymaker.com/products/panchroma-dual-silk",
    "Panchroma Dual Matte PLA":          "https://shop.polymaker.com/products/panchroma-dual-matte",
    "Panchroma Dual Special PLA":        "https://shop.polymaker.com/products/panchroma-dual-matte",
    "Panchroma UV Shift PLA":            "https://shop.polymaker.com/collections/panchroma",
    "Panchroma CoPE (PETG-alt)":         "https://shop.polymaker.com/products/panchroma-cope",
    "Panchroma Gradient Matte PLA":      "https://shop.polymaker.com/products/panchroma-gradient-matte",
    "Panchroma Gradient Silk PLA":       "https://shop.polymaker.com/products/panchroma-gradient-silk",
    "Panchroma Gradient Satin PLA":      "https://shop.polymaker.com/products/panchroma-gradient-satin",
    "Panchroma Gradient Translucent PLA":"https://shop.polymaker.com/products/panchroma-gradient-translucent",
    "Panchroma Gradient Galaxy PLA":     "https://shop.polymaker.com/products/panchroma-gradient-galaxy",
    "Panchroma Gradient Celestial PLA":  "https://shop.polymaker.com/products/panchroma-gradient-celestial",
    "Panchroma Gradient Crystal PLA":    "https://shop.polymaker.com/products/panchroma-gradient-crystal",
    "Panchroma Gradient Starlight PLA":  "https://shop.polymaker.com/products/panchroma-gradient-starlight",
    "Panchroma Gradient Neon PLA":       "https://shop.polymaker.com/collections/panchroma-gradient-pla",
    "Panchroma Gradient Luminous PLA":   "https://shop.polymaker.com/collections/panchroma-gradient-pla",
    // eSUN — esun3d.com
    "PLA-Basic":  "https://www.esun3d.com/pla-basic-product/",
    "ePLA+":      "https://www.esun3d.com/pla-pro-product/",
    "ePLA-Matte": "https://www.esun3d.com/epla-matte-product/",
    "ePLA-Silk":  "https://www.esun3d.com/esilk-pla-product/",
    "ePETG":      "https://www.esun3d.com/petg-product/",
  };

  const BRAND_STORE_URL = {
    "Bambu Lab":  "https://us.store.bambulab.com/collections/bambu-lab-3d-printer-filament",
    "Polymaker":  "https://shop.polymaker.com/collections/panchroma",
    "eSUN":       "https://www.esun3d.com/filaments/",
  };

  function storeUrlFor(rec) {
    return TYPE_STORE_URL[rec.type] || BRAND_STORE_URL[rec.brand] || null;
  }

  /* Maps every raw type string → a unified display group label. */
  const TYPE_TO_GROUP = {
    "PLA Basic":                             "Basic",
    "Panchroma Basic PLA":                   "Basic",
    "PLA Matte":                             "Matte",
    "Panchroma Matte PLA":                   "Matte",
    "PLA Silk+":                             "Silk",
    "Panchroma Silk PLA":                    "Silk",
    "PLA Silk Multi-Color":                  "Silk Dual / Multi",
    "Panchroma Dual Silk PLA":               "Silk Dual / Multi",
    "PLA Marble":                            "Marble",
    "Panchroma Marble PLA":                  "Marble",
    "PLA Galaxy":                            "Galaxy",
    "Panchroma Galaxy PLA":                  "Galaxy",
    "PLA Glow":                              "Glow",
    "Panchroma Glow PLA":                    "Glow",
    "PLA Translucent":                       "Translucent",
    "Panchroma Translucent PLA":             "Translucent",
    "PLA Metal":                             "Metallic",
    "Panchroma Metallic PLA":                "Metallic",
    "PLA-CF":                                "CF",
    "PLA Wood":                              "Wood",
    "PLA Sparkle":                           "Sparkle",
    "PLA Tough+":                            "Tough+",
    "Panchroma Satin PLA":                   "Satin",
    "Panchroma Neon PLA":                    "Neon",
    "Panchroma Luminous PLA":                "Luminous",
    "Panchroma Starlight PLA":               "Starlight",
    "Panchroma Celestial PLA":               "Celestial",
    "Panchroma Dual Matte PLA":              "Dual Matte",
    "Panchroma Dual Special PLA":            "Dual Special",
    "Panchroma UV Shift PLA":                "UV Shift",
    "Panchroma Gradient Matte PLA":          "Gradient Matte",
    "Panchroma Gradient Silk PLA":           "Gradient Silk",
    "Panchroma Gradient Satin PLA":          "Gradient Satin",
    "Panchroma Gradient Translucent PLA":    "Gradient Translucent",
    "Panchroma Gradient Galaxy PLA":         "Gradient Galaxy",
    "Panchroma Gradient Celestial PLA":      "Gradient Celestial",
    "Panchroma Gradient Crystal PLA":        "Gradient Crystal",
    "Panchroma Gradient Starlight PLA":      "Gradient Starlight",
    "Panchroma Gradient Neon PLA":           "Gradient Neon",
    "Panchroma Gradient Luminous PLA":       "Gradient Luminous",
    "PETG Basic":                            "Basic",
    "PETG HF":                               "HF",
    "PETG-CF":                               "CF",
    "PETG Translucent":                      "Translucent",
    "Panchroma CoPE (PETG-alt)":             "CoPE",
    // eSUN
    "PLA-Basic":  "Basic",
    "ePLA+":      "Basic",
    "ePLA-Matte": "Matte",
    "ePLA-Silk":  "Silk",
    "ePETG":      "Basic",
  };

  /* --- State --- */
  const state = {
    filaments: [],
    brands: [],            // unique brands
    types: [],             // unique types
    typesByCategory: { PLA: [], PETG: [] },
    selectedBrands: new Set(),
    selectedTypes: new Set(),
    satRange: [0, 100],
    litRange: [0, 100],
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

  /* Groups an array of raw type strings by their display label, sorted alphabetically. */
  function buildTypeGroups(types) {
    const seen = new Map();
    for (const t of types) {
      const g = TYPE_TO_GROUP[t] || t;
      if (!seen.has(g)) seen.set(g, []);
      seen.get(g).push(t);
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([group, rawTypes]) => ({ group, rawTypes }));
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
    attachSelectAll("pla-filters", state.typesByCategory.PLA);
    fillTypeList("pla-filters", state.typesByCategory.PLA);
    attachSelectAll("petg-filters", state.typesByCategory.PETG);
    fillTypeList("petg-filters", state.typesByCategory.PETG);
  }

  function attachSelectAll(listElemId, types) {
    const heading = document.getElementById(listElemId).closest(".filter-group").querySelector("h2");
    const existing = document.getElementById(listElemId + "-all");
    if (existing) existing.remove();
    const allChecked = types.every(t => state.selectedTypes.has(t));
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = listElemId + "-all";
    btn.className = "select-all-btn";
    btn.textContent = allChecked ? "Deselect all" : "Select all";
    btn.addEventListener("click", () => {
      const nowAll = types.every(t => state.selectedTypes.has(t));
      types.forEach(t => {
        if (nowAll) state.selectedTypes.delete(t);
        else state.selectedTypes.add(t);
      });
      fillTypeList(listElemId, types);
      updateSelectAllState(listElemId, types);
      render();
    });
    heading.insertAdjacentElement("afterend", btn);
  }

  function fillTypeList(elemId, types) {
    const list = document.getElementById(elemId);
    list.innerHTML = "";

    const groups = buildTypeGroups(types);
    const gradientGroups = groups.filter(g => g.group.startsWith("Gradient"));
    const otherGroups   = groups.filter(g => !g.group.startsWith("Gradient"));

    // Render non-gradient groups as flat checkboxes
    otherGroups.forEach(({ group, rawTypes }) => {
      const count = state.filaments.filter(f => rawTypes.includes(f.type)).length;
      const allChecked = rawTypes.every(t => state.selectedTypes.has(t));
      list.appendChild(makeCheckbox({
        label: group, count, checked: allChecked,
        onChange: e => {
          rawTypes.forEach(t => {
            if (e.target.checked) state.selectedTypes.add(t);
            else state.selectedTypes.delete(t);
          });
          updateSelectAllState(elemId, types);
          render();
        },
      }));
    });

    // Render all gradient groups under a collapsible parent row
    if (gradientGroups.length === 0) return;

    const allGradRaw = gradientGroups.flatMap(g => g.rawTypes);
    const totalCount = state.filaments.filter(f => allGradRaw.includes(f.type)).length;

    function gradParentState() {
      const all  = allGradRaw.every(t => state.selectedTypes.has(t));
      const some = allGradRaw.some(t => state.selectedTypes.has(t));
      return { all, some };
    }

    const li = document.createElement("li");

    // Parent row: [label+checkbox] [chevron]
    const row = document.createElement("div");
    row.className = "group-row";

    const lab = document.createElement("label");
    lab.className = "group-label";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.addEventListener("change", e => {
      allGradRaw.forEach(t => {
        if (e.target.checked) state.selectedTypes.add(t);
        else state.selectedTypes.delete(t);
      });
      nested.querySelectorAll('input[type="checkbox"]').forEach(c => {
        c.checked = e.target.checked;
        c.indeterminate = false;
      });
      updateSelectAllState(elemId, types);
      render();
    });
    const { all: initAll, some: initSome } = gradParentState();
    cb.checked = initAll;
    cb.indeterminate = !initAll && initSome;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = "Gradient";

    const numSpan = document.createElement("span");
    numSpan.className = "count";
    numSpan.textContent = totalCount;

    lab.append(cb, nameSpan, numSpan);

    const chevBtn = document.createElement("button");
    chevBtn.type = "button";
    chevBtn.className = "group-chevron";
    chevBtn.setAttribute("aria-expanded", "false");
    chevBtn.setAttribute("aria-label", "Expand gradient variants");
    chevBtn.textContent = "▶";

    chevBtn.addEventListener("click", () => {
      const isOpen = nested.classList.toggle("open");
      chevBtn.classList.toggle("open", isOpen);
      chevBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    row.append(lab, chevBtn);
    li.appendChild(row);

    // Nested list of individual gradient sub-types
    const nested = document.createElement("ul");
    nested.className = "nested-checklist";

    gradientGroups.forEach(({ group, rawTypes: subRaw }) => {
      const subCount = state.filaments.filter(f => subRaw.includes(f.type)).length;
      const subChecked = subRaw.every(t => state.selectedTypes.has(t));
      const subLi = makeCheckbox({
        label: group, count: subCount, checked: subChecked,
        onChange: e => {
          subRaw.forEach(t => {
            if (e.target.checked) state.selectedTypes.add(t);
            else state.selectedTypes.delete(t);
          });
          const { all: nowAll, some: nowSome } = gradParentState();
          cb.checked = nowAll;
          cb.indeterminate = !nowAll && nowSome;
          updateSelectAllState(elemId, types);
          render();
        },
      });
      nested.appendChild(subLi);
    });

    li.appendChild(nested);
    list.appendChild(li);
  }

  function updateSelectAllState(elemId, types) {
    const controlId = elemId + "-all";
    const allChecked = types.every(t => state.selectedTypes.has(t));
    const noneChecked = types.every(t => !state.selectedTypes.has(t));
    const link = document.getElementById(controlId);
    if (link) link.textContent = allChecked ? "Deselect all" : "Select all";
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

  /* --- Range slider helpers --- */
  function bindRangeSlider(minId, maxId, fillId, minLabelId, maxLabelId, onChange) {
    const minEl = document.getElementById(minId);
    const maxEl = document.getElementById(maxId);

    function sync() {
      let lo = parseInt(minEl.value, 10);
      let hi = parseInt(maxEl.value, 10);
      if (lo > hi) { lo = hi; minEl.value = lo; }
      syncRangeSlider(minId, maxId, fillId, minLabelId, maxLabelId, lo, hi);
      minEl.style.zIndex = lo >= hi - 2 ? "5" : "3";
      maxEl.style.zIndex = "4";
      onChange(lo, hi);
    }

    minEl.addEventListener("input", sync);
    maxEl.addEventListener("input", sync);
    sync();
  }

  function syncRangeSlider(minId, maxId, fillId, minLabelId, maxLabelId, lo, hi) {
    document.getElementById(minId).value = lo;
    document.getElementById(maxId).value = hi;
    const fill = document.getElementById(fillId);
    fill.style.left = lo + "%";
    fill.style.right = (100 - hi) + "%";
    document.getElementById(minLabelId).textContent = lo + "%";
    document.getElementById(maxLabelId).textContent = hi + "%";
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
      state.satRange = [0, 100];
      state.litRange = [0, 100];
      state.search = "";
      document.getElementById("search").value = "";
      syncRangeSlider("sat-min", "sat-max", "sat-fill", "sat-min-val", "sat-max-val", 0, 100);
      syncRangeSlider("lit-min", "lit-max", "lit-fill", "lit-min-val", "lit-max-val", 0, 100);
      buildFilters();
      updateSelectAllState("pla-filters", state.typesByCategory.PLA);
      updateSelectAllState("petg-filters", state.typesByCategory.PETG);
      render();
    });

    // Filter sidebar toggle (mobile)
    const sidebar = document.getElementById("sidebar");
    const filterToggle = document.getElementById("filter-toggle");
    function closeSidebar() {
      sidebar.classList.remove("open");
      filterToggle.setAttribute("aria-expanded", "false");
    }
    filterToggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.getElementById("sidebar-close").addEventListener("click", closeSidebar);

    // Range sliders
    bindRangeSlider("sat-min", "sat-max", "sat-fill", "sat-min-val", "sat-max-val",
      (lo, hi) => { state.satRange = [lo, hi]; render(); });
    bindRangeSlider("lit-min", "lit-max", "lit-fill", "lit-min-val", "lit-max-val",
      (lo, hi) => { state.litRange = [lo, hi]; render(); });

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
      if (f.hsl.s < state.satRange[0] || f.hsl.s > state.satRange[1]) return false;
      if (f.hsl.l < state.litRange[0] || f.hsl.l > state.litRange[1]) return false;
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
    const BRAND_SHORT = { "Bambu Lab": "Bambu", "Polymaker": "Polymaker", "eSUN": "eSUN" };
    brand.textContent = BRAND_SHORT[rec.brand] || rec.brand;
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
    if (rec.finish && rec.finish.startsWith("gradient-")) {
      label = "gradient";
    } else {
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

    const url = storeUrlFor(rec);
    if (url) {
      const link = document.createElement("a");
      link.className = "store-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View in store →";
      content.appendChild(link);
    }

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

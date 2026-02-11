// ===== Tabs =====
function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tabPanel"));
  const key = "rso_active_tab";

  if (!tabs.length || !panels.length) return;

  function setActive(id) {
    tabs.forEach(t => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(p => p.classList.toggle("is-active", p.id === id));
    localStorage.setItem(key, id);
  }

  tabs.forEach(t => t.addEventListener("click", () => setActive(t.dataset.tab)));

  const saved = localStorage.getItem(key);
  setActive(saved && document.getElementById(saved) ? saved : "tab_inputs");
}

const STORAGE_KEY = "rso_control_tower_v1";

/** ====== DATA ====== */
const checklistData = [
  {
    team: "Marketing",
    mustHave: 3,
    items: [
      { id: "m_pos", label: "Posicionamiento (1 frase + 3 proof points)", required: true },
      { id: "m_bp", label: "Buyer persona (2–3 perfiles con pains/objeciones)", required: true },
      { id: "m_tono", label: "Tono/voz (sí/no + 5 ejemplos)", required: true },
      { id: "m_cal", label: "Calendario M27 (macro campañas/temporadas)", required: false },
    ],
  },
  {
    team: "Comercial",
    mustHave: 3,
    items: [
      { id: "c_own", label: "Prioridad RS vs LCO por categoría/marca (ownership)", required: true },
      { id: "c_meta", label: "Metas SEO por cluster (Top 1 / Top 3 / defender)", required: true },
      { id: "c_brand", label: "Marcas foco por categoría (ej. TVs RS: TCL/Sony)", required: true },
      { id: "c_rest", label: "Restricciones (qué NO se empuja)", required: false },
    ],
  },
  {
    team: "Catálogo / Merch",
    mustHave: 2,
    items: [
      { id: "k_inv", label: "Inventario actual por categoría/marca", required: true },
      { id: "k_fore", label: "Forecast 3–6 meses (stock esperado)", required: true },
      { id: "k_disc", label: "Reglas de descontinuados + reemplazos (redirect/pruning)", required: false },
    ],
  },
  {
    team: "IT / Producto",
    mustHave: 1,
    items: [
      { id: "i_cap", label: "Capacidades (PLP/PDP/filtros/módulos) + límites", required: true },
      { id: "i_rel", label: "Ventanas de release + responsables", required: false },
    ],
  },
  {
    team: "SEO / Analítica (interno)",
    mustHave: 3,
    items: [
      { id: "s_base", label: "Baseline KPI (GSC + Adobe/GA) y segmentación", required: true },
      { id: "s_ast", label: "Mapa AST v1 (clusters → landings)", required: true },
      { id: "s_policy", label: "Política URLs (pruning/redirect/index rules)", required: true },
      { id: "s_back", label: "Plan backlinks tóxicos (si aplica en ES)", required: false },
    ],
  },
];

const ownershipRows = [
  { cat: "Televisores", owner: "RadioShack", rs: "TCL, Sony", lco: "Samsung, LG", goal: "Top 3" },
  { cat: "Audio", owner: "RadioShack", rs: "JBL, Sony", lco: "Genérico", goal: "Top 3" },
  { cat: "Consolas", owner: "RadioShack", rs: "PlayStation, Xbox", lco: "—", goal: "Top 1" },
  { cat: "Celulares", owner: "LCO", rs: "Accesorios / gadgets", lco: "Samsung, Xiaomi, Apple", goal: "Top 1" },
  { cat: "Accesorios", owner: "Compartido", rs: "Cables, cargadores, smartwatches", lco: "Accesorios masivos", goal: "Top 3" },
];

const roadmapRows = [
  {
    name: "Técnico (Higiene)",
    cells: [
      "Definir reglas URLs + plan backlinks",
      "Cleanup backlinks + pruning URLs sin producto",
      "Ajustes PLP indexación + monitoreo cobertura",
      "Hardening para temporada alta",
      "Limpieza anual + fixes recurrentes",
    ],
  },
  {
    name: "AST (Landings transacc.)",
    cells: [
      "Mapa AST v1 (20–40 clusters ES)",
      "10–15 landings AST ES (marca/categoría/atributo)",
      "Escala a 60–80 clusters en 2 países",
      "Hubs BF/Cyber por marca/categoría",
      "Consolidar winners + retirar losers",
    ],
  },
  {
    name: "Contenido evergreen",
    cells: [
      "Plan editorial “a prueba de inventario”",
      "6–8 guías/comparativas (intención compra)",
      "Replicar playbook en 2 países",
      "Refrescar contenido para BF/Cyber",
      "Refresh de top contenidos + nuevo backlog",
    ],
  },
  {
    name: "Autoridad / PR",
    cells: [
      "Lista partners potenciales",
      "Primeras menciones/links de calidad",
      "Escala de partnerships por país",
      "Activaciones estacionales (si aplica)",
      "Revisión perfil backlinks + continuidad",
    ],
  },
  {
    name: "Medición + reporting",
    cells: [
      "Tablero base ES + definición KPIs",
      "Ritual MBR + SOV por cluster",
      "Comparativo multi-país (2 países más)",
      "Monitoreo diario clusters críticos",
      "Informe cierre M27 + plan M28",
    ],
  },
];

/** ====== STATE ====== */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : { checks: {}, ownershipApproved: false, backlogReady: false, ownership: ownershipRows };
  } catch {
    return { checks: {}, ownershipApproved: false, backlogReady: false, ownership: ownershipRows };
  }
}
function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
let state = loadState();

/** ====== UI HELPERS ====== */
function paintChip(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;

  // OK = gris (estable), PENDIENTE = rojo (alerta)
  el.style.borderColor = ok ? "rgba(211,211,211,.55)" : "rgba(225,6,0,.75)";
  el.style.background = ok ? "rgba(211,211,211,.10)" : "rgba(225,6,0,.14)";
  el.style.color = "rgba(211,211,211,.95)";
  el.textContent = `${id.toUpperCase()} ${ok ? "LISTO" : "PENDIENTE"}`;
}

/** ====== RENDER CHECKLIST ====== */
function renderChecklist() {
  const mount = document.getElementById("checklistMount");
  if (!mount) return;

  mount.innerHTML = "";

  checklistData.forEach(section => {
    const sec = document.createElement("div");
    sec.className = "section";

    const head = document.createElement("div");
    head.className = "sectionHead";

    const ttl = document.createElement("div");
    ttl.className = "sectionTitle";
    ttl.textContent = section.team;

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = `Must-have: ${section.mustHave}`;

    head.appendChild(ttl);
    head.appendChild(badge);
    sec.appendChild(head);

    section.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "item";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!state.checks[item.id];
      cb.addEventListener("change", () => {
        state.checks[item.id] = cb.checked;
        saveState(state);
        updateGatesAndProgress();
      });

      const label = document.createElement("label");
      label.innerHTML = `${item.label} ${item.required ? '<span class="req">(requerido)</span>' : ""}`;

      row.appendChild(cb);
      row.appendChild(label);
      sec.appendChild(row);
    });

    mount.appendChild(sec);
  });

  // toggles
  const ownCb = document.getElementById("ownershipApproved");
  const backCb = document.getElementById("backlogReady");

  if (ownCb) {
    ownCb.checked = !!state.ownershipApproved;
    ownCb.onchange = () => {
      state.ownershipApproved = ownCb.checked;
      saveState(state);
      updateGatesAndProgress();
    };
  }

  if (backCb) {
    backCb.checked = !!state.backlogReady;
    backCb.onchange = () => {
      state.backlogReady = backCb.checked;
      saveState(state);
      updateGatesAndProgress();
    };
  }
}

/** ====== OWNERSHIP TABLE ====== */
function renderOwnership() {
  const body = document.getElementById("ownBody");
  if (!body) return;

  body.innerHTML = "";

  state.ownership.forEach((r, idx) => {
    const tr = document.createElement("tr");

    // categoría
    const tdCat = document.createElement("td");
    tdCat.textContent = r.cat;
    tr.appendChild(tdCat);

    // owner
    const tdOwner = document.createElement("td");
    const sel = document.createElement("select");
    sel.className = "select";
    ["RadioShack", "LCO", "Compartido"].forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if (opt === r.owner) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => {
      state.ownership[idx].owner = sel.value;
      saveState(state);
    });
    tdOwner.appendChild(sel);
    tr.appendChild(tdOwner);

    // rs
    tr.appendChild(tdInput(idx, "rs", r.rs));
    // lco
    tr.appendChild(tdInput(idx, "lco", r.lco));

    // goal
    const tdGoal = document.createElement("td");
    const goal = document.createElement("select");
    goal.className = "select";
    ["Top 1", "Top 3", "Top 5"].forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if (opt === r.goal) o.selected = true;
      goal.appendChild(o);
    });
    goal.addEventListener("change", () => {
      state.ownership[idx].goal = goal.value;
      saveState(state);
    });
    tdGoal.appendChild(goal);
    tr.appendChild(tdGoal);

    body.appendChild(tr);
  });

  function tdInput(idx, key, val) {
    const td = document.createElement("td");
    const inp = document.createElement("input");
    inp.className = "input";
    inp.value = val || "";
    inp.addEventListener("input", () => {
      state.ownership[idx][key] = inp.value;
      saveState(state);
    });
    td.appendChild(inp);
    return td;
  }
}

/** ====== ROADMAP ====== */
function renderRoadmap() {
  const rm = document.getElementById("rmBody");
  if (!rm) return;

  rm.innerHTML = "";

  roadmapRows.forEach(r => {
    const row = document.createElement("div");
    row.className = "rmRow";

    const name = document.createElement("div");
    name.className = "rmName";
    name.textContent = r.name;
    row.appendChild(name);

    r.cells.forEach(c => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = c;
      row.appendChild(cell);
    });

    rm.appendChild(row);
  });
}

/** ====== GATES + PROGRESS ====== */
function updateGatesAndProgress() {
  const allItems = checklistData.flatMap(s => s.items);
  const done = allItems.filter(i => state.checks[i.id]).length;
  const pct = Math.round((done / allItems.length) * 100);

  const bar = document.getElementById("progressBar");
  const txt = document.getElementById("progressText");
  if (bar) bar.style.width = `${pct}%`;
  if (txt) txt.textContent = `${pct}%`;

  // Hito 0: todos los required marcados
  const required = allItems.filter(i => i.required);
  const gate0Ready = required.every(i => !!state.checks[i.id]);

  // Hito 1: gate0 + ownershipApproved
  const gate1Ready = gate0Ready && !!state.ownershipApproved;

  // Hito 2: gate1 + backlogReady
  const gate2Ready = gate1Ready && !!state.backlogReady;

  paintChip("gate0", gate0Ready);
  paintChip("gate1", gate1Ready);
  paintChip("gate2", gate2Ready);
}

/** ====== RESET ====== */
function initReset() {
  const btn = document.getElementById("btnReset");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!confirm("¿Resetear checklist y mapa?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    renderChecklist();
    renderOwnership();
    renderRoadmap();
    updateGatesAndProgress();
  });
}

/** ====== INIT ====== */
window.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initReset();
  renderChecklist();
  renderOwnership();
  renderRoadmap();
  updateGatesAndProgress();
});

// ======= SVG arrows (curved) =======
function makeSVG(svgEl){
  while(svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  const parent = svgEl.parentElement;
  const r = parent.getBoundingClientRect();
  svgEl.setAttribute("width", r.width);
  svgEl.setAttribute("height", r.height);
  svgEl.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);

  const defs = document.createElementNS("http://www.w3.org/2000/svg","defs");

  function marker(id, color){
    const m = document.createElementNS("http://www.w3.org/2000/svg","marker");
    m.setAttribute("id", id);
    m.setAttribute("markerWidth","10");
    m.setAttribute("markerHeight","10");
    m.setAttribute("refX","9");
    m.setAttribute("refY","3");
    m.setAttribute("orient","auto");
    m.setAttribute("markerUnits","strokeWidth");
    const p = document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("d","M0,0 L10,3 L0,6 Z");
    p.setAttribute("fill", color);
    m.appendChild(p);
    defs.appendChild(m);
  }

  marker("arrowNeutral","rgba(255,255,255,.65)");
  marker("arrowYes","rgba(34,197,94,.90)");
  marker("arrowNo","rgba(239,68,68,.90)");

  svgEl.appendChild(defs);
}

function anchorPoint(el, container, anchor){
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  const x0 = r.left - c.left;
  const y0 = r.top - c.top;

  const map = {
    top:    {x: x0 + r.width/2, y: y0},
    bottom: {x: x0 + r.width/2, y: y0 + r.height},
    left:   {x: x0, y: y0 + r.height/2},
    right:  {x: x0 + r.width, y: y0 + r.height/2},
    center: {x: x0 + r.width/2, y: y0 + r.height/2},
  };
  return map[anchor] || map.right;
}

function drawCurve(svgEl, p1, p2, style){
  const dx = Math.max(60, Math.abs(p2.x - p1.x) * 0.35);
  const c1 = {x: p1.x + dx, y: p1.y};
  const c2 = {x: p2.x - dx, y: p2.y};

  const d = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  const path = document.createElementNS("http://www.w3.org/2000/svg","path");
  path.setAttribute("d", d);
  path.setAttribute("fill","none");
  path.setAttribute("stroke", style.stroke || "rgba(255,255,255,.55)");
  path.setAttribute("stroke-width", style.width || "2.5");
  path.setAttribute("stroke-linecap","round");
  path.setAttribute("stroke-linejoin","round");
  path.setAttribute("marker-end", `url(#${style.marker || "arrowNeutral"})`);
  svgEl.appendChild(path);
}

function label(svgEl, text, x, y, color){
  const g = document.createElementNS("http://www.w3.org/2000/svg","g");

  const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
  rect.setAttribute("x", x - 8);
  rect.setAttribute("y", y - 14);
  rect.setAttribute("width", (text.length * 7.2) + 14);
  rect.setAttribute("height", 18);
  rect.setAttribute("rx", 9);
  rect.setAttribute("fill", "rgba(0,0,0,.35)");
  rect.setAttribute("stroke", "rgba(255,255,255,.18)");

  const t = document.createElementNS("http://www.w3.org/2000/svg","text");
  t.textContent = text;
  t.setAttribute("x", x);
  t.setAttribute("y", y);
  t.setAttribute("fill", color || "rgba(255,255,255,.8)");
  t.setAttribute("font-size", "12");
  t.setAttribute("font-weight", "900");
  t.setAttribute("font-family", "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial");

  g.appendChild(rect);
  g.appendChild(t);
  svgEl.appendChild(g);
}

function renderConnections(diagramId, svgId, connections){
  const diagram = document.getElementById(diagramId);
  const stage = diagram.querySelector(".stage, .timeline-stage");
  const svg = document.getElementById(svgId);

  makeSVG(svg);

  connections.forEach(conn => {
    const from = document.getElementById(conn.from);
    const to   = document.getElementById(conn.to);
    if(!from || !to) return;

    const p1 = anchorPoint(from, stage, conn.fromAnchor || "right");
    const p2 = anchorPoint(to, stage, conn.toAnchor || "left");

    const style = conn.style || {};
    drawCurve(svg, p1, p2, style);

    if(conn.text){
      const lx = (p1.x + p2.x)/2 + (conn.dx || 0);
      const ly = (p1.y + p2.y)/2 + (conn.dy || -8);
      label(svg, conn.text, lx, ly, style.stroke);
    }
  });
}

// ======= Connections =======
const checklistConnections = [
  { from:"n_start", to:"n_mkt", fromAnchor:"right", toAnchor:"left" },
  { from:"n_mkt", to:"n_com", fromAnchor:"right", toAnchor:"left" },
  { from:"n_com", to:"n_cat", fromAnchor:"right", toAnchor:"left" },
  { from:"n_cat", to:"n_it",  fromAnchor:"bottom", toAnchor:"top" },

  { from:"n_mkt", to:"d_inputs", fromAnchor:"left", toAnchor:"right" },
  { from:"n_com", to:"d_inputs", fromAnchor:"left", toAnchor:"right" },
  { from:"n_cat", to:"d_inputs", fromAnchor:"left", toAnchor:"right" },
  { from:"n_it",  to:"d_inputs", fromAnchor:"left", toAnchor:"right" },

  {
    from:"d_inputs", to:"n_fix",
    fromAnchor:"bottom", toAnchor:"top",
    text:"NO", style:{ stroke:"rgba(239,68,68,.9)", marker:"arrowNo", width:"3" }, dy:-10
  },
  {
    from:"n_fix", to:"n_start",
    fromAnchor:"top", toAnchor:"left",
    style:{ stroke:"rgba(239,68,68,.65)", marker:"arrowNo", width:"2.5" }
  },
  {
    from:"d_inputs", to:"n_serp",
    fromAnchor:"bottom", toAnchor:"top",
    text:"SÍ", style:{ stroke:"rgba(34,197,94,.9)", marker:"arrowYes", width:"3" }, dy:-10
  },

  { from:"n_serp", to:"d_approve", fromAnchor:"right", toAnchor:"left" },

  {
    from:"d_approve", to:"n_adjust",
    fromAnchor:"top", toAnchor:"bottom",
    text:"NO", style:{ stroke:"rgba(239,68,68,.9)", marker:"arrowNo", width:"3" }, dy:-10
  },
  {
    from:"n_adjust", to:"n_serp",
    fromAnchor:"bottom", toAnchor:"top",
    style:{ stroke:"rgba(239,68,68,.65)", marker:"arrowNo", width:"2.5" }
  },
  {
    from:"d_approve", to:"n_ast",
    fromAnchor:"right", toAnchor:"left",
    text:"SÍ", style:{ stroke:"rgba(34,197,94,.9)", marker:"arrowYes", width:"3" }, dy:-10
  },
  { from:"n_ast", to:"n_go", fromAnchor:"right", toAnchor:"left" },
];

const roadmapConnections = [
  { from:"r0", to:"r1", fromAnchor:"right", toAnchor:"left" },
  { from:"r1", to:"r2", fromAnchor:"right", toAnchor:"left" },
  { from:"r2", to:"r3", fromAnchor:"right", toAnchor:"left" },
  { from:"r3", to:"r4", fromAnchor:"right", toAnchor:"left" },
];

function renderAll(){
  renderConnections("checklistDiagram", "checklistSvg", checklistConnections);
  renderConnections("roadmapDiagram", "roadmapSvg", roadmapConnections);
}

window.addEventListener("load", renderAll);
window.addEventListener("resize", () => {
  clearTimeout(window.__rt);
  window.__rt = setTimeout(renderAll, 80);
});

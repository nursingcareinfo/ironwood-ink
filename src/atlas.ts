// ============================================================
// Ink Atlas — vis-network renderer for the graphify knowledge graph
// Consumes public/atlas/graph.json (graphify-compatible schema).
// ============================================================
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import "vis-network/styles/vis-network.css";

type Node = { id: string; label: string; kind: string; community?: string; description?: string };
type Edge = { source: string; target: string; relation: string; tag?: string };

type Graph = { nodes: Node[]; edges: Edge[] };

const KIND_COLOR: Record<string, string> = {
  STYLE: "#c07a3f",
  MOTIF: "#e9e0d2",
  MEANING: "#b3122c",
  ARTIST: "#e01830",
  PLACEMENT: "#7a8fa8",
};

const REL_COLOR: Record<string, string> = {
  SYMBOLIZES: "#b3122c",
  EMBODIES: "#b3122c",
  IN_STYLE: "#c07a3f",
  PAIRS_WITH: "#e9e0d2",
  SPECIALIZES_IN: "#e01830",
  SUITED_FOR: "#7a8fa8",
  PART_OF: "#7a8fa8",
};
const REL_FALLBACK = "#555043";

function normalize(g: unknown): Graph {
  const graph = g as Graph;
  // Accept graphify's raw output too: nodes may use `type`, edges `from`/`to`.
  const nodes = (graph.nodes ?? []).map((raw) => {
    const n = raw as Node & { type?: string };
    return {
      id: String(n.id),
      label: n.label ?? String(n.id),
      kind: (n.kind ?? n.type ?? "MOTIF").toUpperCase(),
      community: n.community,
      description: n.description,
    };
  });
  const edges = (graph.edges ?? []).map((raw) => {
    const e = raw as Edge & { from?: string; to?: string };
    return {
      source: String(e.source ?? e.from),
      target: String(e.target ?? e.to),
      relation: (e.relation ?? "RELATES_TO").toUpperCase(),
      tag: e.tag,
    };
  });
  return { nodes, edges };
}

async function main() {
  const res = await fetch(import.meta.env.BASE_URL + "atlas/graph.json");
  const { nodes, edges } = normalize(await res.json());

  const nodeSet = new DataSet(
    nodes.map((n) => ({
      id: n.id,
      label: n.label,
      color: { background: KIND_COLOR[n.kind] ?? "#555043", border: "#0b0806", highlight: { background: "#e9e0d2", border: "#e01830" } },
      font: { color: "#e9e0d2", face: "Inter", size: 14, strokeWidth: 0 },
      shape: "dot",
      size: n.kind === "MEANING" ? 14 : n.kind === "ARTIST" ? 20 : 17,
      borderWidth: 2,
      title: n.label,
    }))
  );

  const edgeSet = new DataSet(
    edges.map((e, i) => ({
      id: i,
      from: e.source,
      to: e.target,
      color: { color: REL_COLOR[e.relation] ?? REL_FALLBACK, opacity: 0.55, highlight: "#e9e0d2" },
      width: 1.2,
      smooth: { enabled: true, type: "continuous", roundness: 0.4 },
      title: `${e.relation}${e.tag ? ` · ${e.tag}` : ""}`,
    }))
  );

  const container = document.getElementById("atlas-canvas")!;
  const network = new Network(
    container,
    { nodes: nodeSet, edges: edgeSet },
    {
      physics: {
        enabled: true,
        solver: "barnesHut",
        barnesHut: { gravitationalConstant: -6500, centralGravity: 0.06, springLength: 110, springConstant: 0.03, damping: 0.5 },
        stabilization: { iterations: 250, updateInterval: 40 },
      },
      interaction: { hover: true, tooltipDelay: 120, hideEdgesOnDrag: true },
      nodes: { scaling: { min: 10, max: 30 } },
    }
  );

  const info = document.getElementById("node-info")!;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  function renderNode(id: string) {
    const n = byId.get(id);
    if (!n) return;
    const rels = edges.filter((e) => e.source === id || e.target === id);
    const lines = rels.map((e) => {
      const other = e.source === id ? e.target : e.source;
      const otherNode = byId.get(other);
      const dir = e.source === id ? `→ ${otherNode?.label ?? other}` : `← ${otherNode?.label ?? other}`;
      return `<li>${dir} · <span style="color: var(--copper);">${e.relation}</span>${e.tag === "INFERRED" ? ' <span style="opacity:.6;">(inferred)</span>' : ""}</li>`;
    }).join("");
    info.innerHTML = `
      <div class="kind">${n.kind}</div>
      <h2>${n.label}</h2>
      <p>${n.description ?? "No description in the graph."}</p>
      <div class="rels"><ul>${lines || "<li>No connections.</li>"}</ul></div>`;
  }

  network.on("click", (params: { nodes?: string[] }) => {
    const id = params.nodes?.[0];
    if (id) renderNode(id);
  });

  const search = document.getElementById("atlas-search") as HTMLInputElement;
  // vis-network's TS types omit `hidden` from update payloads; it is supported
  // at runtime, so we drive those updates through a loose view of the sets.
  type LooseSet = { forEach(cb: (item: Record<string, unknown>) => void): void; update(patch: Record<string, unknown>): void };
  const looseNodes = nodeSet as unknown as LooseSet;
  const looseEdges = edgeSet as unknown as LooseSet;
  const setAllVisible = () => {
    looseNodes.forEach((n) => looseNodes.update({ id: n.id, hidden: false }));
    looseEdges.forEach((e) => looseEdges.update({ id: e.id, hidden: false }));
  };
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    setAllVisible();
    if (!q) return;
    const matches = new Set(nodes.filter((n) => n.label.toLowerCase().includes(q) || n.kind.toLowerCase().includes(q)).map((n) => n.id));
    looseNodes.forEach((n) => looseNodes.update({ id: n.id, hidden: !matches.has(String(n.id)) }));
    looseEdges.forEach((e) => looseEdges.update({ id: e.id, hidden: !(matches.has(String(e.from)) && matches.has(String(e.to))) }));
  });

  // Select the first style node on load so the panel starts populated.
  renderNode("japanese-irezumi");
}

main().catch((err) => {
  document.getElementById("node-info")!.innerHTML = `<p style="color: var(--blood-bright);">Atlas failed to load: ${String(err)}</p>`;
  console.error(err);
});

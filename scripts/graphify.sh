#!/usr/bin/env bash
# ============================================================
# Ink Atlas — graphify pipeline
# Regenerates the knowledge graph from the knowledge corpus.
#
# graphify (Graphify-Labs) extracts concepts + relationships from
# content/knowledge/*.md into graph.json, which the Atlas page renders.
#
# NOTE: graphify's LLM extraction pass requires Claude Code (`claude`).
# Until it's installed, the curated graph at public/atlas/graph.json
# (authored by hand from the same corpus) is the source of truth —
# this script merges graphify's output over it when available.
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v graphify >/dev/null 2>&1; then
  echo "graphify CLI not found. Install: uv tool install graphifyy" >&2
  exit 1
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "!! Claude Code not found — graphify's LLM extraction pass needs it."
  echo "!! Keeping the curated graph (public/atlas/graph.json) as-is."
  echo "!! Install Claude Code, then re-run: ./scripts/graphify.sh"
  exit 0
fi

echo "==> Running graphify on content/knowledge …"
mkdir -p /tmp/ironwood-atlas-out
graphify content/knowledge --out /tmp/ironwood-atlas-out --mode deep

echo "==> Merging graph.json into public/atlas/ …"
if [ -f /tmp/ironwood-atlas-out/graph.json ]; then
  cp /tmp/ironwood-atlas-out/graph.json public/atlas/graph.json
  echo "==> public/atlas/graph.json updated. (Keep graphify's raw output in"
  echo "    graphify-out/ for review if you want to diff before overwriting.)"
else
  echo "!! graphify produced no graph.json — keeping existing graph." >&2
  exit 1
fi

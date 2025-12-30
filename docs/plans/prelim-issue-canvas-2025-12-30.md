# Overview: Interactive Issue Selection & Sequencing Refactor

I want to refactor the current app away from dependency storage and toward an interactive issue-selection and sequencing tool. The core interaction is: search GitHub issues on the left, curate and arrange selected issues on a React Flow canvas on the right.

### High-Level Concept

Build a two-pane application that combines live GitHub issue search with a free-form visual canvas. The left pane is an issue query and browsing interface backed directly by the GitHub Issues API (no local dependency graph or precomputed relationships). The right pane is a React Flow canvas where selected issues become nodes that can be arranged, linked, grouped, and visually annotated.

### Core UI Layout

* Top (or initial step): repository/project configuration (e.g. GitHub repo + PAT).
* Left pane: issue search and results list.

  * Supports GitHub issue query syntax (e.g. state:open, labels, assignee).
  * Displays a paginated or capped result set (e.g. 20–50 issues).
* Right pane: React Flow canvas.

  * Issues can be added from the left via click or drag-and-drop.
  * Each issue becomes a node with title, number, and minimal metadata.

### Canvas Capabilities

* Manual linking of issues into sequences or graphs (no semantic dependency meaning yet).
* Visual grouping via:

  * Node coloring and labels.
  * Optional bounding boxes or group/parent nodes if supported by React Flow.
* Purely user-defined structure: the graph is an editorial / planning artifact, not an inferred dependency model.

### Data & Architecture Assumptions

* Issues are fetched live from the GitHub API; caching is optional and deferred.
* The canvas state (nodes, edges, colors, groups) is stored locally (e.g. in app state or persisted later), independent of GitHub.
* No requirement to sync links or relationships back to GitHub at this stage.

### Goal

Enable fast sense-making and planning over GitHub issues by separating *retrieval* (search/query) from *organization* (visual sequencing), without premature commitment to dependency semantics or task ontology.

/**
 * BFHL Challenge – Core Service
 *
 * ─────────────────────────────────────────────
 * TEST EXAMPLES
 * ─────────────────────────────────────────────
 *
 * Example 1 – Basic tree
 *   Input : ["A->B", "A->C", "B->D"]
 *   Trees : A(root) → B,C; B → D   depth=3
 *   Output: 1 tree, 0 cycles, largest_tree_root="A"
 *
 * Example 2 – Duplicate & invalid entries
 *   Input : ["A->B", "A->B", "A->C", "X->X", "bad", "1->2"]
 *   duplicate_edges : ["A->B"]
 *   invalid_entries : ["X->X", "bad", "1->2"]
 *   Trees: A→B,C   depth=2
 *
 * Example 3 – Multi-parent (child claimed by two parents)
 *   Input : ["A->B", "C->B"]          B already has parent A, ignore C->B
 *   Trees : A→B  and  C (lone root)
 *
 * Example 4 – Two independent trees
 *   Input : ["A->B", "C->D", "C->E"]
 *   Trees : A→B (depth 2), C→D,E (depth 2)
 *   summary: total_trees=2, largest_tree_root="A" (tie → lex smaller)
 *
 * Example 5 – Pure cycle (no external root)
 *   Input : ["A->B", "B->C", "C->A"]
 *   Cycle : root="A" (lex smallest), has_cycle=true, no depth
 *
 * Example 6 – Cycle with an external root feeding in
 *   Input : ["Z->A", "A->B", "B->A"]
 *   Z is a real root; A and B form a cycle reachable from Z
 *   The hierarchy rooted at Z reports has_cycle=true
 *
 * Example 7 – Mixed forest (one normal tree + one cycle group)
 *   Input : ["A->B", "B->C", "C->B", "D->E"]
 *   A→B→C cycle component, D→E normal tree
 *
 * ─────────────────────────────────────────────
 */

// ── 1. VALIDATION ────────────────────────────────────────────────────────────

/**
 * Validate a single entry string.
 * Rules:
 *   - Must match exactly  /^[A-Z]->[A-Z]$/  after trimming
 *   - Self-loops (X->X) are invalid
 * Returns { valid: true, from, to } or { valid: false }
 */
const validateEntry = (raw) => {
  const entry = raw.trim();
  const match = entry.match(/^([A-Z])->([A-Z])$/);
  if (!match) return { valid: false };
  const [, from, to] = match;
  if (from === to) return { valid: false }; // self-loop
  return { valid: true, from, to };
};

/**
 * Partition raw data array into:
 *   validEdges   – array of { from, to } objects
 *   invalidEntries – original strings that failed validation
 */
export const validateEntries = (data) => {
  const validEdges = [];
  const invalidEntries = [];

  for (const raw of data) {
    const result = validateEntry(raw);
    if (result.valid) {
      validEdges.push({ from: result.from, to: result.to });
    } else {
      invalidEntries.push(raw.trim());
    }
  }

  return { validEdges, invalidEntries };
};

// ── 2. DEDUPLICATION ─────────────────────────────────────────────────────────

/**
 * Remove duplicate edges from the valid edge list.
 * - First occurrence is kept.
 * - Each subsequent duplicate is recorded once in duplicateEdges.
 * Returns { uniqueEdges, duplicateEdges }
 *
 * e.g. ["A->B", "A->B", "A->B"]  →  uniqueEdges: [A->B], duplicateEdges: ["A->B"]
 */
export const deduplicateEdges = (validEdges) => {
  const seen = new Set();
  const uniqueEdges = [];
  const duplicateSet = new Set(); // prevents the same dup appearing twice
  const duplicateEdges = [];

  for (const edge of validEdges) {
    const key = `${edge.from}->${edge.to}`;
    if (seen.has(key)) {
      if (!duplicateSet.has(key)) {
        duplicateEdges.push(key);
        duplicateSet.add(key);
      }
    } else {
      seen.add(key);
      uniqueEdges.push(edge);
    }
  }

  return { uniqueEdges, duplicateEdges };
};

// ── 3. ADJACENCY / PARENT MAP ─────────────────────────────────────────────────

/**
 * Build:
 *   children  – Map<node, Set<child>>   (adjacency list)
 *   parentOf  – Map<child, parent>      (first-parent wins; later ignored)
 *   allNodes  – Set of every node seen
 *
 * Multi-parent rule: if a child already has a parent assigned,
 * silently discard the new edge (the child is NOT added to the new parent's
 * children list either, to keep the tree consistent).
 */
export const buildAdjacency = (uniqueEdges) => {
  const children = new Map();
  const parentOf = new Map();
  const allNodes = new Set();

  for (const { from, to } of uniqueEdges) {
    allNodes.add(from);
    allNodes.add(to);

    // Ensure the parent node has an entry in children map
    if (!children.has(from)) children.set(from, new Set());

    // Multi-parent: only assign if child has no parent yet
    if (!parentOf.has(to)) {
      parentOf.set(to, from);
      children.get(from).add(to);
    }
    // else: silently ignore – child already has a parent
  }

  // Ensure every node appears in children map (even leaf nodes)
  for (const node of allNodes) {
    if (!children.has(node)) children.set(node, new Set());
  }

  return { children, parentOf, allNodes };
};

// ── 4. CYCLE DETECTION (DFS) ──────────────────────────────────────────────────

/**
 * Detect if there is a cycle reachable from `root` using iterative DFS.
 * Tracks the current recursion stack to identify back-edges.
 * Returns true if a cycle exists, false otherwise.
 */
const hasCycleFromRoot = (root, children) => {
  // stack entries: { node, iterator } to simulate recursive DFS
  const inStack = new Set();
  const visited = new Set();

  const stack = [{ node: root, childIter: children.get(root)[Symbol.iterator]() }];
  inStack.add(root);
  visited.add(root);

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    const next = top.childIter.next();

    if (next.done) {
      inStack.delete(top.node);
      stack.pop();
    } else {
      const child = next.value;
      if (inStack.has(child)) return true; // back-edge → cycle
      if (!visited.has(child)) {
        visited.add(child);
        inStack.add(child);
        stack.push({ node: child, childIter: children.get(child)[Symbol.iterator]() });
      }
    }
  }

  return false;
};

// ── 5. DEPTH CALCULATION ──────────────────────────────────────────────────────

/**
 * Calculate depth = number of nodes in the longest root-to-leaf path.
 * Uses iterative BFS/DFS; safe to call only when no cycle exists.
 */
const calcDepth = (root, children) => {
  let maxDepth = 0;
  // Stack stores [node, currentDepth]
  const stack = [[root, 1]];

  while (stack.length > 0) {
    const [node, depth] = stack.pop();
    if (depth > maxDepth) maxDepth = depth;
    for (const child of children.get(node)) {
      stack.push([child, depth + 1]);
    }
  }

  return maxDepth;
};

// ── 6. TREE SERIALISATION ─────────────────────────────────────────────────────

/**
 * Recursively build the nested tree object expected by the response:
 *   { "A": { "B": {}, "C": { "D": {} } } }
 */
const buildTreeObject = (node, children) => {
  const obj = {};
  for (const child of children.get(node)) {
    obj[child] = buildTreeObject(child, children);
  }
  return obj;
};

// ── 7. FOREST BUILDER ─────────────────────────────────────────────────────────

/**
 * Identify connected components, determine roots, detect cycles, and
 * produce the final `hierarchies` array.
 *
 * Root selection rules:
 *   - A node is a root if it never appears as a child (parentOf has no entry).
 *   - For a pure cycle component (every node has a parent inside the component),
 *     pick the lexicographically smallest node as the synthetic root.
 *
 * Returns { hierarchies, summary }
 */
export const buildForest = (children, parentOf, allNodes) => {
  // ── Find connected components (undirected) ──────────────────────────────
  const visited = new Set();
  const components = []; // array of Set<node>

  const getNeighbours = (node) => {
    const nbrs = new Set(children.get(node));
    // Also add reverse edges so we find the full undirected component
    for (const [child, parent] of parentOf) {
      if (parent === node) nbrs.add(child);
      if (child === node) nbrs.add(parent);
    }
    return nbrs;
  };

  for (const node of [...allNodes].sort()) {
    if (visited.has(node)) continue;
    const component = new Set();
    const queue = [node];
    while (queue.length) {
      const cur = queue.shift();
      if (visited.has(cur)) continue;
      visited.add(cur);
      component.add(cur);
      for (const nbr of getNeighbours(cur)) {
        if (!visited.has(nbr)) queue.push(nbr);
      }
    }
    components.push(component);
  }

  // ── Build hierarchy for each component ──────────────────────────────────
  const hierarchies = [];

  for (const component of components) {
    // Nodes in this component that are NOT a child of any node
    const roots = [...component].filter((n) => !parentOf.has(n)).sort();

    let root;
    let isPureCycle = false;

    if (roots.length > 0) {
      // Normal case – use first (lex smallest) root
      // (Multiple roots in one component can only happen if multi-parent
      //  suppression created a disconnected sub-tree; treat first as root.)
      root = roots[0];
    } else {
      // Pure cycle – every node has a parent; pick lex smallest as root
      root = [...component].sort()[0];
      isPureCycle = true;
    }

    const cycleDetected = hasCycleFromRoot(root, children) || isPureCycle;

    if (cycleDetected) {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
    } else {
      const depth = calcDepth(root, children);
      const tree = { [root]: buildTreeObject(root, children) };
      hierarchies.push({ root, tree, depth });
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const trees = hierarchies.filter((h) => !h.has_cycle);
  const cycles = hierarchies.filter((h) => h.has_cycle);

  // largest_tree_root = deepest tree; tie → lex smaller root
  let largestTreeRoot = null;
  if (trees.length > 0) {
    const best = trees.reduce((acc, cur) => {
      if (cur.depth > acc.depth) return cur;
      if (cur.depth === acc.depth && cur.root < acc.root) return cur;
      return acc;
    });
    largestTreeRoot = best.root;
  }

  const summary = {
    total_trees: trees.length,
    total_cycles: cycles.length,
    largest_tree_root: largestTreeRoot,
  };

  return { hierarchies, summary };
};

// ── 8. MAIN ORCHESTRATOR ──────────────────────────────────────────────────────

/**
 * processData – called by the controller with the raw `data` array.
 *
 * Pipeline:
 *   validate → deduplicate → build adjacency → build forest → shape response
 */
export const processData = (data) => {
  // Step 1 – Validate
  const { validEdges, invalidEntries } = validateEntries(data);

  // Step 2 – Deduplicate
  const { uniqueEdges, duplicateEdges } = deduplicateEdges(validEdges);

  // Step 3 – Build adjacency / parent map
  const { children, parentOf, allNodes } = buildAdjacency(uniqueEdges);

  // Step 4 – Handle empty input (no valid edges at all)
  if (allNodes.size === 0) {
    return {
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      hierarchies: [],
      summary: {
        total_trees: 0,
        total_cycles: 0,
        largest_tree_root: null,
      },
    };
  }

  // Step 5 – Build forest (detect cycles, calculate depths, serialise trees)
  const { hierarchies, summary } = buildForest(children, parentOf, allNodes);

  return {
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    hierarchies,
    summary,
  };
};

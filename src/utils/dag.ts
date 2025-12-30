import type { GitHubIssue, IssueDependency } from '../types';
import type { Node, Edge } from 'reactflow';
import dagre from 'dagre';

export function getLayoutedElements(issues: GitHubIssue[], dependencies: IssueDependency[]) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 250;
    const nodeHeight = 100;

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Initialize dagre graph
    dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right layout

    // Create nodes
    issues.forEach((issue) => {
        const nodeId = issue.number.toString();
        nodes.push({
            id: nodeId,
            data: { label: `#${issue.number}: ${issue.title}`, issue },
            position: { x: 0, y: 0 },
            type: 'issueNode', // We'll create a custom node later
        });

        dagreGraph.setNode(nodeId, { width: nodeWidth, height: nodeHeight });
    });

    // Create edges based on dependencies
    dependencies.forEach((dep) => {
        const target = dep.issueNumber.toString();
        dep.dependsOn.forEach((sourceNum) => {
            const source = sourceNum.toString();

            // Only create edge if source issue exists in the fetched list
            if (issues.find(i => i.number === sourceNum)) {
                edges.push({
                    id: `e${source}-${target}`,
                    source: source,
                    target: target,
                    animated: true,
                });

                dagreGraph.setEdge(source, target);
            }
        });
    });

    // Apply layout
    dagre.layout(dagreGraph);

    // Update node positions from dagre
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
}

export function detectCycles(dependencies: IssueDependency[]): number[][] {
    const adj = new Map<number, number[]>();
    dependencies.forEach(d => adj.set(d.issueNumber, d.dependsOn));

    const visited = new Set<number>();
    const stack = new Set<number>();
    const cycles: number[][] = [];

    function dfs(u: number, path: number[]) {
        visited.add(u);
        stack.add(u);

        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            if (stack.has(v)) {
                const cycleIndex = path.indexOf(v);
                cycles.push(path.slice(cycleIndex));
            } else if (!visited.has(v)) {
                dfs(v, [...path, v]);
            }
        }

        stack.delete(u);
    }

    const allNodes = new Set<number>();
    dependencies.forEach(d => {
        allNodes.add(d.issueNumber);
        d.dependsOn.forEach(n => allNodes.add(n));
    });

    allNodes.forEach(node => {
        if (!visited.has(node)) {
            dfs(node, [node]);
        }
    });

    return cycles;
}

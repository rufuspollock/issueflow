import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    useReactFlow,
    MarkerType,
} from 'reactflow';
import type {
    Connection,
    Edge,
    Node,
    NodeTypes,
    NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '../utils/cn';
import IssueNode from './IssueNode';
import ContextMenu from './ContextMenu';
import type { GitHubIssue } from '../types';

interface CanvasProps {
    className?: string;
}

const nodeTypes: NodeTypes = {
    issueNode: IssueNode,
};

// Initial state helpers
const getInitialNodes = (): Node[] => {
    const stored = localStorage.getItem('if-nodes');
    return stored ? JSON.parse(stored) : [];
};

const getInitialEdges = (): Edge[] => {
    const stored = localStorage.getItem('if-edges');
    return stored ? JSON.parse(stored) : [];
};

function CanvasContent({ className }: CanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());
    const { project } = useReactFlow();

    // Context Menu State
    const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);

    // Persistence
    useEffect(() => {
        localStorage.setItem('if-nodes', JSON.stringify(nodes));
        localStorage.setItem('if-edges', JSON.stringify(edges));
    }, [nodes, edges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            type: 'default',
            markerEnd: { type: 'customArrow' }, // Reference the custom marker
            animated: false,
        }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = 'issueNode';
            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const issueDataString = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type || !issueDataString || !reactFlowBounds) {
                return;
            }

            const issue: GitHubIssue = JSON.parse(issueDataString);
            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            // Check for duplicates? Maybe allow duplicates for now or check by ID
            const newNode: Node = {
                id: `issue-${issue.id}`,
                type,
                position,
                data: { label: issue.title, issue }, // Passing full issue data
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [project, setNodes]
    );

    const onNodeContextMenu: NodeMouseHandler = useCallback(
        (event, node) => {
            event.preventDefault();

            // Calculate position relative to container
            const pane = reactFlowWrapper.current?.getBoundingClientRect();
            if (!pane) return;

            setMenu({
                id: node.id,
                top: event.clientY - pane.top,
                left: event.clientX - pane.left,
            });
        },
        [setMenu]
    );

    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    return (
        <div className={cn("w-full h-full relative", className)} ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <defs>
                    <marker
                        id="customArrow"
                        viewBox="0 -5 10 10"
                        refX="12"
                        refY="0"
                        markerWidth="15"
                        markerHeight="15"
                        orient="auto-start-reverse"
                        fill="black"
                    >
                        <path d="M0,-5L10,0L0,5Z" />
                    </marker>
                </defs>
                <Background color="#94a3b8" gap={20} size={1} className="opacity-20" />
                <Controls />
                <MiniMap
                    nodeStrokeColor={(n) => (n.type === 'issueNode' ? '#3b82f6' : '#ccc')}
                    nodeColor={(n) => (n.type === 'issueNode' ? '#eff6ff' : '#fff')}
                />

                {menu && (
                    <ContextMenu
                        {...menu}
                        onClose={() => setMenu(null)}
                    />
                )}
            </ReactFlow>
        </div>
    );
}

export function Canvas(props: CanvasProps) {
    return (
        <ReactFlowProvider>
            <CanvasContent {...props} />
        </ReactFlowProvider>
    )
}

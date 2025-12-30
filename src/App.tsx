import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { fetchIssues, parseDependencies } from './services/github';
import { getLayoutedElements } from './utils/dag';
import { Github, Play, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { nodeTypes } from './constants/nodeTypes';

function IssueFlow() {

  const [repo, setRepo] = useState(() => localStorage.getItem('if-repo') || '');
  const [token, setToken] = useState(() => localStorage.getItem('if-token') || '');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached issues on mount
  useEffect(() => {
    const cachedIssues = localStorage.getItem('if-issues');
    if (cachedIssues && repo && token) {
      try {
        const issues = JSON.parse(cachedIssues);
        const dependencies = parseDependencies(issues);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(issues, dependencies);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (e) {
        console.error('Failed to parse cached issues', e);
      }
    }
  }, []);

  // Sync config to localStorage
  useEffect(() => {
    localStorage.setItem('if-repo', repo);
    localStorage.setItem('if-token', token);
  }, [repo, token]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleFetch = async () => {
    if (!repo || !token) {
      setError('Please provide both repo (owner/name) and GitHub token.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const issues = await fetchIssues(repo, token);
      localStorage.setItem('if-issues', JSON.stringify(issues));

      const dependencies = parseDependencies(issues);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(issues, dependencies);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching issues.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      {/* Header / Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white-70 backdrop-blur-xl border-b border-slate-200 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Github className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">IssueFlow</h1>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="owner/repo"
            className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-sm transition-all"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <div className="relative group">
            <input
              type="password"
              placeholder="GitHub Token (PAT)"
              className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-sm transition-all"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                title="How to get a PAT? (Needs 'repo' scope)"
                className="text-slate-400 hover:text-blue-500 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
          <button
            onClick={handleFetch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-all shadow-md active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Fetch Issues
          </button>
        </div>
      </header>

      {/* Main Graph Area */}
      <main className="flex-1 relative">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg shadow-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
          <MiniMap
            style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            nodeStrokeColor={(n) => (n.type === 'issueNode' ? '#3b82f6' : '#ccc')}
            nodeColor={(n) => (n.type === 'issueNode' ? '#eff6ff' : '#fff')}
          />
        </ReactFlow>

        {!loading && nodes.length === 0 && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
            <Github className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Enter a repository and token to visualize issues</p>
            <p className="text-sm">Make sure some issues have "depends on #XX" in their description</p>
            <p className="text-xs mt-2 pointer-events-auto">
              Need a token? <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Create a PAT with 'repo' scope</a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <IssueFlow />
    </ReactFlowProvider>
  );
}

import { useState, useCallback, useEffect, useMemo } from 'react';
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

import { fetchIssues } from './services/github';
import { fetchMockIssues } from './services/mock-data';
import { parseDependencies } from './utils/processing';
import { getLayoutedElements } from './utils/dag';
import IssueNode from './components/IssueNode';
import TaskListView from './components/TaskListView';
import { Github, Play, Loader2, AlertCircle, HelpCircle, Database, LayoutList, Network } from 'lucide-react';
import type { GitHubIssue } from './types';

function IssueFlow() {
  const nodeTypes = useMemo(() => ({
    issueNode: IssueNode,
  }), []);

  // View State
  const [view, setView] = useState<'graph' | 'list'>('graph');

  // Data State
  const [repo, setRepo] = useState(() => localStorage.getItem('if-repo') || '');
  const [token, setToken] = useState(() => localStorage.getItem('if-token') || '');
  const [issues, setIssues] = useState<GitHubIssue[]>([]);

  // Graph State
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dependencies = useMemo(() => parseDependencies(issues), [issues]);

  // Load cached issues on mount
  useEffect(() => {
    const cachedIssues = localStorage.getItem('if-issues');
    if (cachedIssues && repo && token) {
      try {
        const parsedIssues = JSON.parse(cachedIssues);
        setIssues(parsedIssues);

        const deps = parseDependencies(parsedIssues);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(parsedIssues, deps);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (e) {
        console.error('Failed to parse cached issues', e);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      const fetchedIssues = await fetchIssues(repo, token);
      displayIssues(fetchedIssues);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching issues.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedIssues = await fetchMockIssues();
      displayIssues(fetchedIssues);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching mock issues.');
    } finally {
      setLoading(false);
    }
  };

  const displayIssues = (fetchedIssues: any[]) => {
    localStorage.setItem('if-issues', JSON.stringify(fetchedIssues));
    setIssues(fetchedIssues);

    const deps = parseDependencies(fetchedIssues);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(fetchedIssues, deps);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  return (
    <div className="flex w-full h-full bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-16 flex-none bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 z-20 shadow-sm">
        <div className="p-2 bg-blue-600 rounded-lg text-white mb-2 shadow-sm">
          <Github className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-2 w-full px-2">
          <button
            onClick={() => setView('graph')}
            className={`p-3 rounded-xl flex justify-center transition-all ${view === 'graph'
              ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
              : 'text-slate-400 hover:bg-slate-100'
              }`}
            title="Graph View"
          >
            <Network className="w-6 h-6" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-3 rounded-xl flex justify-center transition-all ${view === 'list'
              ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
              : 'text-slate-400 hover:bg-slate-100'
              }`}
            title="List View"
          >
            <LayoutList className="w-6 h-6" />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header / Toolbar */}
        <header className="flex-none flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {view === 'graph' ? 'Dependency Graph' : 'Task List'}
            </h1>
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
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Fetch
            </button>
            <button
              onClick={handleMockFetch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-all border border-slate-200 active:scale-95 whitespace-nowrap"
              title="Try with sample data"
            >
              <Database className="w-4 h-4" />
              Demo
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg shadow-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Graph View */}
          <div
            className="w-full h-full"
            style={{ display: view === 'graph' ? 'block' : 'none' }}
          >
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
          </div>

          {/* List View */}
          <div
            className="w-full h-full"
            style={{ display: view === 'list' ? 'block' : 'none' }}
          >
            <TaskListView issues={issues} dependencies={dependencies} />
          </div>

          {/* Empty State Overlay */}
          {!loading && issues.length === 0 && !error && (
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 backdrop-blur-sm">
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

import { useState, useEffect } from 'react';
import { Settings, Search, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { cn } from '../utils/cn';
import { searchIssues } from '../services/github';
import type { GitHubIssue } from '../types';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'search' | 'settings'>('search');

    // Config State
    const [repo, setRepo] = useState(() => localStorage.getItem('if-repo') || '');
    const [token, setToken] = useState(() => localStorage.getItem('if-token') || '');

    // Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GitHubIssue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync config
    useEffect(() => {
        localStorage.setItem('if-repo', repo);
        localStorage.setItem('if-token', token);
    }, [repo, token]);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;
        if (!token) {
            setError("Please add a GitHub token in Config");
            setActiveTab('settings');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Append repo:owner/name if repo is set and not already in query
            let finalQuery = query;
            if (repo && !query.includes('repo:')) {
                finalQuery = `repo:${repo} ${query}`;
            }

            const issues = await searchIssues(finalQuery, token);
            setResults(issues);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Drag Start Handler
    const onDragStart = (event: React.DragEvent, issue: GitHubIssue) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(issue));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className={cn("flex flex-col h-full bg-slate-50 border-r border-slate-200", className)}>
            {/* Header */}
            <div className="py-2 px-4 border-b border-slate-200 bg-white">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight font-mono">Issue Flow</h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-slate-200 bg-white shadow-sm z-10">
                <button
                    onClick={() => setActiveTab('search')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors flex-1 justify-center border-b-2 relative",
                        activeTab === 'search'
                            ? "text-blue-600 border-blue-600 bg-blue-50/10"
                            : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                    )}
                >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors flex-1 justify-center border-b-2 relative",
                        activeTab === 'settings'
                            ? "text-blue-600 border-blue-600 bg-blue-50/10"
                            : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                    )}
                >
                    <Settings className="w-4 h-4" />
                    <span>Config</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-left-4 duration-200">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">GitHub Repo</label>
                            <input
                                type="text"
                                placeholder="owner/repo"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                value={repo}
                                onChange={e => setRepo(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 mt-1">Default scope for searches</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Personal Access Token</label>
                            <input
                                type="password"
                                placeholder="ghp_..."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 mt-1">Required for API access</p>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <div className="text-xs text-slate-500">
                                <p className="mb-2">How to get a token:</p>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Go to GitHub Settings &gt; Developer Settings</li>
                                    <li>Personal Access Tokens &gt; Tokens (classic)</li>
                                    <li>Generate new token (repo scope needed)</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEARCH TAB */}
                {activeTab === 'search' && (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
                        {/* Search Box */}
                        <div className="p-4 border-b border-slate-200 bg-white z-10">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="is:open label:bug..."
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </form>
                            {error && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                    <AlertCircle className="w-3 h-3 flex-none" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-100">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span className="text-xs">Searching GitHub...</span>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="text-center py-12 px-4 text-slate-400">
                                    <p className="text-sm">No results found.</p>
                                    <p className="text-xs mt-1">Try a different query or check your repo settings.</p>
                                </div>
                            ) : (
                                results.map(issue => (
                                    <div
                                        key={issue.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, issue)}
                                        className="group bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing flex gap-3 items-start select-none"
                                    >
                                        <div className="mt-1 text-slate-300 group-hover:text-blue-400 transition-colors">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-slate-500">#{issue.number}</span>
                                                {/* Simple state indicator */}
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    issue.state === 'open' ? "bg-green-500" : "bg-purple-500"
                                                )} />
                                            </div>
                                            <h4 className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 mb-1">
                                                {issue.title}
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                                {issue.labels.map(label => (
                                                    <span
                                                        key={label.name}
                                                        className="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                                                        style={{
                                                            backgroundColor: `#${label.color}20`,
                                                            color: `#${label.color}`,
                                                            border: `1px solid #${label.color}40`
                                                        }}
                                                    >
                                                        {label.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

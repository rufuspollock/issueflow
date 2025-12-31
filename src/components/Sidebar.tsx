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
        <div className={cn("flex flex-col h-full bg-gray-50 border-r border-gray-200", className)}>
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-900">Issue Flow</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
                <button
                    onClick={() => setActiveTab('search')}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                        "border-b-2 -mb-px",
                        activeTab === 'search'
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                        "border-b-2 -mb-px",
                        activeTab === 'settings'
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Config</span>
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="p-6 space-y-6 overflow-y-auto h-full">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                GitHub Repo
                            </label>
                            <input
                                type="text"
                                placeholder="owner/repo"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                value={repo}
                                onChange={e => setRepo(e.target.value)}
                            />
                            <p className="mt-1.5 text-xs text-gray-500">Default scope for searches</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Personal Access Token
                            </label>
                            <input
                                type="password"
                                placeholder="ghp_..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                            />
                            <p className="mt-1.5 text-xs text-gray-500">Required for API access</p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">How to get a token:</p>
                            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Go to GitHub Settings → Developer Settings</li>
                                <li>Personal Access Tokens → Tokens (classic)</li>
                                <li>Generate new token (repo scope needed)</li>
                            </ol>
                        </div>
                    </div>
                )}

                {/* SEARCH TAB */}
                {activeTab === 'search' && (
                    <div className="flex flex-col h-full">
                        {/* Search Box */}
                        <div className="p-4 bg-white border-b border-gray-200">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="is:open label:bug..."
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                    />
                                </div>
                            </form>
                            {error && (
                                <div className="mt-3 flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                    <span className="text-sm">Searching GitHub...</span>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <p className="text-sm">No results found.</p>
                                    <p className="text-xs mt-1">Try a different query or check your repo settings.</p>
                                </div>
                            ) : (
                                results.map(issue => (
                                    <div
                                        key={issue.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, issue)}
                                        className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-gray-300 group-hover:text-blue-500 transition-colors pt-0.5">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-medium text-gray-500">#{issue.number}</span>
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        issue.state === 'open' ? "bg-green-500" : "bg-purple-500"
                                                    )} />
                                                </div>
                                                <h4 className="text-sm font-medium text-gray-900 leading-snug mb-2 line-clamp-2">
                                                    {issue.title}
                                                </h4>
                                                {issue.labels.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {issue.labels.map(label => (
                                                            <span
                                                                key={label.name}
                                                                className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded"
                                                                style={{
                                                                    backgroundColor: `#${label.color}20`,
                                                                    color: `#${label.color}`,
                                                                }}
                                                            >
                                                                {label.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
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

import React, { useState, useMemo } from 'react';
import type { GitHubIssue, IssueDependency } from '../types';
import { ExternalLink, ChevronRight, ChevronDown, CheckCircle2, Circle } from 'lucide-react';

interface TaskListViewProps {
    issues: GitHubIssue[];
    dependencies: IssueDependency[];
}

interface IssueItemProps {
    issue: GitHubIssue;
    issueMap: Map<number, GitHubIssue>;
    dependencyMap: Map<number, number[]>;
    depth?: number;
}

const IssueItem: React.FC<IssueItemProps> = ({ issue, issueMap, dependencyMap, depth = 0 }) => {
    const [expanded, setExpanded] = useState(false);
    const dependsOnIds = dependencyMap.get(issue.number) || [];
    const hasChildren = dependsOnIds.length > 0;

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const getStatusIcon = (state: string) => {
        if (state === 'closed') return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
        return <Circle className="w-4 h-4 text-green-600" />;
    };

    return (
        <div className="flex flex-col">
            <div
                className={`flex items-center gap-3 py-2 px-3 hover:bg-slate-50 border-b border-slate-100 group transition-colors ${depth > 0 ? 'ml-6 border-l-2 border-l-slate-200' : ''}`}
            >
                <button
                    onClick={toggleExpand}
                    className={`p-1 rounded hover:bg-slate-200 text-slate-400 ${!hasChildren ? 'invisible' : ''}`}
                >
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                <div className="text-slate-500" title={`Status: ${issue.state}`}>
                    {getStatusIcon(issue.state)}
                </div>

                <span className="font-mono text-xs text-slate-500 w-12 shrink-0">#{issue.number}</span>

                <div className="flex-1 min-w-0 font-medium text-slate-700 truncate cursor-pointer" onClick={toggleExpand}>
                    {issue.title}
                </div>

                <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open in GitHub"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {expanded && hasChildren && (
                <div className="flex flex-col">
                    {dependsOnIds.map((id) => {
                        const childIssue = issueMap.get(id);
                        if (!childIssue) return null; // Or render a placeholder
                        return (
                            <IssueItem
                                key={id}
                                issue={childIssue}
                                issueMap={issueMap}
                                dependencyMap={dependencyMap}
                                depth={depth + 1}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default function TaskListView({ issues, dependencies }: TaskListViewProps) {
    const [search, setSearch] = useState('');
    const [showOpenOnly, setShowOpenOnly] = useState(false);

    const { issueMap, dependencyMap, filteredIssues } = useMemo(() => {
        const iMap = new Map(issues.map(i => [i.number, i]));
        const dMap = new Map(dependencies.map(d => [d.issueNumber, d.dependsOn]));

        let filtered = issues;

        if (showOpenOnly) {
            filtered = filtered.filter(i => i.state === 'open');
        }

        if (search.trim()) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(i =>
                i.title.toLowerCase().includes(lowerSearch) ||
                String(i.number).includes(lowerSearch)
            );
        }

        // Sort logic (open first, then by ID desc)
        filtered = [...filtered].sort((a, b) => {
            if (a.state === b.state) {
                return b.number - a.number;
            }
            return a.state === 'open' ? -1 : 1;
        });

        return { issueMap: iMap, dependencyMap: dMap, filteredIssues: filtered };
    }, [issues, dependencies, search, showOpenOnly]);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Search items..."
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showOpenOnly}
                            onChange={(e) => setShowOpenOnly(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        Show open issues only
                    </label>
                    <div className="text-xs text-slate-500">
                        Showing {filteredIssues.length} tasks
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => (
                        <IssueItem
                            key={issue.number}
                            issue={issue}
                            issueMap={issueMap}
                            dependencyMap={dependencyMap}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <p>No tasks found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

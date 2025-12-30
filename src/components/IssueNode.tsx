import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { GitHubIssue } from '../types';
import { ExternalLink, CheckCircle2, CircleDot } from 'lucide-react';

const IssueNode = ({ data }: NodeProps<{ label: string; issue: GitHubIssue }>) => {
    const { issue } = data;
    const isClosed = issue.state === 'closed';

    return (
        <div className={`px-4 py-3 shadow-xl rounded-xl border-2 transition-all duration-300 bg-white-80 backdrop-blur-md ${isClosed ? 'border-green-200 bg-green-50-50' : 'border-blue-200 bg-blue-50-50'
            } hover-scale-105 hover:shadow-2xl min-w-[250px]`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-400 border-2 border-white" />

            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-400 font-mono">#{issue.number}</span>
                    {isClosed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                        <CircleDot className="w-4 h-4 text-blue-500" />
                    )}
                </div>

                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                    {issue.title}
                </h3>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <img
                            src={issue.user.avatar_url}
                            alt={issue.user.login}
                            className="w-5 h-5 rounded-full ring-2 ring-white"
                        />
                        <span className="text-xs-extra text-gray-500 font-medium">@{issue.user.login}</span>
                    </div>

                    <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-400 border-2 border-white" />
        </div>
    );
};

export default memo(IssueNode);

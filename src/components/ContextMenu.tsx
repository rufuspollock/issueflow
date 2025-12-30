import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { Trash2, Palette } from 'lucide-react';

interface ContextMenuProps {
    id: string;
    top: number;
    left: number;
    right?: number;
    bottom?: number;
    onClose: () => void;
    // ... any other props
}

export default function ContextMenu({
    id,
    top,
    left,
    right,
    bottom,
    onClose,
}: ContextMenuProps) {
    const { setNodes } = useReactFlow();

    const deleteNode = useCallback(() => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        onClose();
    }, [id, setNodes, onClose]);

    const changeColor = useCallback((color: string) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            // We'll store custom style overrides in data for now
                            style: { ...node.data.style, backgroundColor: color },
                        },
                        // Also need to update style prop if we want it to react immediately on the node container?
                        // Actually, best to pass this data into the custom Node component.
                        // For now, let's just assume our IssueNode reads `data.style`.
                    };
                }
                return node;
            })
        );
        onClose();
    }, [id, setNodes, onClose]);

    return (
        <div
            style={{ top, left, right, bottom, display: 'flex', flexDirection: 'column' }}
            className="absolute bg-white border border-slate-200 shadow-xl rounded-lg z-50 min-w-150 overflow-hidden py-1"
        >
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 mb-1">
                Node Actions
            </div>

            <div className="px-2 py-1">
                <label className="text-xs text-slate-500 mb-2 block px-2">Set Status Color</label>
                <div className="flex flex-col gap-1 px-2 mb-2">
                    {[
                        { color: '#ffffff', label: 'Default', border: '#e2e8f0' },
                        { color: '#f8fafc', label: 'Backlog (Gray)', border: '#cbd5e1' }, // Gray
                        { color: '#eff6ff', label: 'Next (Blue)', border: '#93c5fd' },   // Blue
                        { color: '#fff7ed', label: 'In Progress (Orange)', border: '#fdba74' }, // Orange
                        { color: '#f0fdf4', label: 'Done (Green)', border: '#86efac' },   // Green
                        { color: '#fef2f2', label: 'Urgent (Red)', border: '#fca5a5' },     // Red
                    ].map((opt) => (
                        <button
                            key={opt.color}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-slate-50 transition-colors text-left group"
                            onClick={() => changeColor(opt.color)}
                        >
                            <span
                                className="w-4 h-4 rounded-full border shadow-sm group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: opt.color, borderColor: opt.border }}
                            />
                            <span className="text-xs text-slate-600 font-medium">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={deleteNode} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete
            </button>
        </div>
    );
}

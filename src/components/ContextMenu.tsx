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
            style={{ top, left, right, bottom }}
            className="absolute bg-white border border-slate-200 shadow-xl rounded-lg z-50 min-w-150 overflow-hidden flex flex-col py-1"
        >
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 mb-1">
                Node Actions
            </div>

            <div className="px-2 py-1">
                <label className="text-xs text-slate-500 mb-1 block px-2">Set Color</label>
                <div className="flex gap-1 px-2 mb-2">
                    {['#eff6ff', '#f0fdf4', '#fef2f2', '#fff7ed', '#f0f9ff', '#faf5ff'].map((c) => (
                        <button
                            key={c}
                            className="w-4 h-4 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }}
                            onClick={() => changeColor(c)}
                            title={c}
                        />
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

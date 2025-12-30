import { ReactFlowProvider } from 'reactflow';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';

function IssueFlow() {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-white">
      {/* Left Sidebar - Search & Results */}
      <Sidebar className="w-400 flex-none z-50 shadow-xl" />

      {/* Right Canvas - Interactive Area */}
      <main className="flex-1 relative bg-slate-50 z-0">
        <Canvas />
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

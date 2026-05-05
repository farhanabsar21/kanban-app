import { useParams } from "react-router-dom";

export function WorkspacePage() {
  const { workspaceId } = useParams();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-2xl font-bold">Workspace</h1>
      <p className="mt-2 text-slate-400">{workspaceId}</p>
    </main>
  );
}

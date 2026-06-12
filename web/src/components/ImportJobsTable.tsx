import { db } from "@/lib/db";

export default async function ImportJobsTable({ type }: { type: string }) {
  const jobs = await db.importJob.findMany({
    where: { type },
    orderBy: { startedAt: "desc" },
    take: 15,
  });

  if (jobs.length === 0) {
    return <p className="text-sm text-neutral-400">No import jobs yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
          <tr>
            <th className="px-4 py-3">Query</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Found</th>
            <th className="px-4 py-3">Imported</th>
            <th className="px-4 py-3">Duplicates</th>
            <th className="px-4 py-3">When</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-b border-neutral-50 last:border-0">
              <td className="px-4 py-3 font-medium text-neutral-800">{j.query}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${j.status === "completed" ? "bg-emerald-100 text-emerald-800" : j.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                  {j.status}
                </span>
                {j.errors && <p className="mt-1 max-w-xs break-words text-xs text-red-600">{j.errors}</p>}
              </td>
              <td className="px-4 py-3">{j.found}</td>
              <td className="px-4 py-3">{j.imported}</td>
              <td className="px-4 py-3">{j.duplicates}</td>
              <td className="px-4 py-3 text-neutral-400">{j.startedAt.toLocaleString("en-GB")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

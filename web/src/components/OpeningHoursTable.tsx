import { DAY_KEYS, DAY_LABELS, type OpeningHours } from "@/lib/types";

export default function OpeningHoursTable({ hours }: { hours: OpeningHours }) {
  if (Object.keys(hours).length === 0) {
    return <p className="text-sm text-neutral-400">Opening hours not provided.</p>;
  }
  return (
    <table className="w-full text-sm">
      <tbody>
        {DAY_KEYS.map((day) => {
          const ranges = hours[day];
          return (
            <tr key={day} className="border-b border-neutral-100 last:border-0">
              <td className="py-1.5 pr-4 font-medium text-neutral-700">{DAY_LABELS[day]}</td>
              <td className="py-1.5 text-right text-neutral-500">
                {ranges && ranges.length > 0
                  ? ranges.map((r) => `${r.open}–${r.close}`).join(", ")
                  : "Closed"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

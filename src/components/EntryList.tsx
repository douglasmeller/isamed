import { EntryItem } from "@/components/EntryItem";
import type { Entry, ItemLink, Task } from "@/lib/types";

export function EntryList({
  entries,
  emptyLabel,
  allTasks,
  allEntries,
  allLinks,
}: {
  entries: Entry[];
  emptyLabel: string;
  allTasks?: Task[];
  allEntries?: Entry[];
  allLinks?: ItemLink[];
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-pink-200 px-4 py-6 text-center text-ink-soft">
        {emptyLabel}
      </p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at),
  );

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((entry) => (
        <EntryItem
          key={entry.id}
          entry={entry}
          allTasks={allTasks}
          allEntries={allEntries}
          allLinks={allLinks}
        />
      ))}
    </div>
  );
}

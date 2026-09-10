import { EntryItem } from "@/components/EntryItem";
import type { DayItem, Entry, ItemLink } from "@/lib/types";

export function EntryList({
  entries,
  emptyLabel,
  dayItems,
  links,
  onLinksChange,
}: {
  entries: Entry[];
  emptyLabel: string;
  dayItems?: DayItem[];
  links?: ItemLink[];
  onLinksChange?: () => void;
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
          dayItems={dayItems}
          links={links}
          onLinksChange={onLinksChange}
        />
      ))}
    </div>
  );
}

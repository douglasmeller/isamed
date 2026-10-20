import { SectionTabs } from "@/components/SectionTabs";
import { ESTUDOS_TABS } from "@/lib/navigation";

export default function EstudosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 xl:max-w-6xl">
      <SectionTabs tabs={ESTUDOS_TABS} />
      {children}
    </div>
  );
}

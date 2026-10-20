import { SectionTabs } from "@/components/SectionTabs";
import { PESSOAL_TABS } from "@/lib/navigation";

export default function PessoalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 xl:max-w-6xl">
      {/* Com uma aba so, a barra de abas nao acrescenta nada. */}
      {PESSOAL_TABS.length > 1 && <SectionTabs tabs={PESSOAL_TABS} />}
      {children}
    </div>
  );
}

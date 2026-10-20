import { SectionTabs } from "@/components/SectionTabs";

export default function PessoalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 xl:max-w-6xl">
      <SectionTabs section="pessoal" />
      {children}
    </div>
  );
}

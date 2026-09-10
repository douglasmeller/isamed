import { Nav } from "@/components/Nav";
import { Header } from "@/components/Header";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-full flex-col md:pl-56">
      <Nav />
      {/* Unico elemento que de fato rola -- html/body ficam parados (ver
          globals.css) para o "elastico" do scroll no celular ficar contido
          aqui dentro, sem vazar por baixo da barra de navegacao fixa. */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <Header />
        <main className="flex flex-col px-5 pb-24 sm:px-8 md:pb-10">{children}</main>
      </div>
    </div>
  );
}

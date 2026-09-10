import { Nav } from "@/components/Nav";
import { Header } from "@/components/Header";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col md:pl-56">
      <Nav />
      <Header />
      <main className="flex flex-1 flex-col px-5 pb-24 sm:px-8 md:pb-10">{children}</main>
    </div>
  );
}

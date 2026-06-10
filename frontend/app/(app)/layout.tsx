import Header from "@/app/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="h-[6vh] shadow-b-2xl">
        <Header />
      </div>
      <div className="h-[94vh] text-white bg-[#2b445f] flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}

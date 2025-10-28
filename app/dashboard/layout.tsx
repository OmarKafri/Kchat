import { Contacts } from "@/components/contacts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen">
      <div className="w-[300px] border-r border-gray-700">
        <Contacts />
      </div>
      <div className="flex-1 bg-gray-800 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

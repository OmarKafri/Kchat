import { Contacts } from "@/components/contacts";
import { getContacts } from "@/lib/actions/user";
import { unreadMessages } from "@/lib/actions/messages";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  let initialContacts: Awaited<ReturnType<typeof getContacts>>["data"] = [];
  let initialUnread: string[] = [];

  if (userId) {
    const [contactsRes, unreadRes] = await Promise.all([
      getContacts(userId),
      unreadMessages(userId),
    ]);
    if (contactsRes.success && contactsRes.data) initialContacts = contactsRes.data;
    if (unreadRes.success && unreadRes.data) initialUnread = unreadRes.data;
  }

  return (
    <div className="flex h-screen w-screen">
      <div className="w-[300px] border-r border-gray-700">
        <Contacts
          initialContacts={initialContacts ?? []}
          initialUnread={initialUnread}
        />
      </div>
      <div className="flex-1 bg-gray-800 overflow-y-auto">{children}</div>
    </div>
  );
}
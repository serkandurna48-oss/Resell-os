"use client";

import { useRouter } from "next/navigation";

export default function ItemRow({
  itemId,
  children,
}: {
  itemId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(`/items/${itemId}`)}
      className="hover:bg-muted/30 transition-colors cursor-pointer"
    >
      {children}
    </tr>
  );
}

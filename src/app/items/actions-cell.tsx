"use client";

export default function ActionsCell({ children }: { children: React.ReactNode }) {
  return (
    <td
      className="px-4 py-3 text-right whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </td>
  );
}

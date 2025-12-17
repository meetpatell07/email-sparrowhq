"use client";

import { approveDraft, discardDraft } from "@/app/actions";
import { useTransition } from "react";

type DraftItem = {
  draft: {
    id: string;
    content: string;
    status: string | null;
  };
  email: {
    id: string;
    subject: string | null;
    snippet: string | null;
  };
};

export function DraftApprovalList({ items }: { items: DraftItem[] }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      try {
        await approveDraft(id);
        alert("Draft sent!");
      } catch (e) {
        alert("Error sending draft");
      }
    });
  };

  const handleDiscard = (id: string) => {
    if (!confirm("Are you sure?")) return;
    startTransition(async () => {
      await discardDraft(id);
    });
  };

  if (items.length === 0) {
    return <p className="text-gray-500">No pending drafts.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map(({ draft, email }) => (
        <div key={draft.id} className="border p-4 rounded bg-orange-50">
          <h3 className="font-medium text-lg">{email.subject}</h3>
          <p className="markdown text-gray-800 my-2 whitespace-pre-wrap font-mono text-sm bg-white p-2 border">
            {draft.content}
          </p>
          <div className="flex gap-2">
            <button
              disabled={isPending}
              onClick={() => handleApprove(draft.id)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Approve & Send
            </button>
            <button
              disabled={isPending}
              onClick={() => handleDiscard(draft.id)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              Discard
            </button>
            {/* Edit to be implemented */}
            <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 opacity-50 cursor-not-allowed">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

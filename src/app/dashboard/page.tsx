"use client";

import useSWR from "swr";
import { EmailRow } from "@/components/EmailRow";
import { GmailEmail } from "@/lib/gmail";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<{ emails: GmailEmail[] }>(
    "/api/emails?limit=20",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading emails...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-destructive">Failed to load emails</div>
      </div>
    );
  }

  const emails = data?.emails || [];

  const parsedEmails = emails.map((email) => ({
    ...email,
    receivedAt: new Date(email.receivedAt),
  }));

  return (
    <div className="min-h-screen">
      <section className="p-6">
        {parsedEmails.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No emails found.
          </div>
        ) : (
          parsedEmails.map((email) => <EmailRow key={email.id} email={email} />)
        )}
      </section>
    </div>
  );
}

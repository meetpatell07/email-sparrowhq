"use client";

import useSWR from "swr";
import { EmailRow } from "@/components/EmailRow";
import { GmailEmail } from "@/lib/gmail";
import { DashboardLayout } from "@/components/DashboardLayout";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<{ emails: GmailEmail[] }>(
    "/api/emails?limit=20",
    fetcher
  );

  const emails = data?.emails || [];

  const parsedEmails = emails.map((email) => ({
    ...email,
    receivedAt: new Date(email.receivedAt),
  }));

  return (
    <DashboardLayout>
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-gray-50 flex-shrink-0">
        <h1 className="text-xl font-semibold text-black">Dashboard</h1>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl text-gray-900 font-bold mb-2">Recent Emails</h2>
            <p className="text-gray-400 text-sm font-medium leading-none">
              You have {parsedEmails.length} recent messages
            </p>
          </div>

          <section className="space-y-3 pb-8">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Loading your mailbox...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-500 font-medium">
                Failed to load emails. Please try again.
              </div>
            ) : parsedEmails.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No emails found.</p>
              </div>
            ) : (
              parsedEmails.map((email) => <EmailRow key={email.id} email={email} />)
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

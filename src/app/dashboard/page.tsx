import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { emails, drafts, invoices } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { DraftApprovalList } from "@/components/DraftApprovalList";
import { SyncButton } from "@/components/SyncButton";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/login");
    }

    // Fetch Data
    const recentEmails = await db.select().from(emails)
        .where(eq(emails.userId, session.user.id))
        .orderBy(desc(emails.receivedAt))
        .limit(20);

    // Need to join drafts? Or just fetch separaterly.
    // Drafts interact with emails.
    const pendingDrafts = await db.select({
        draft: drafts,
        email: emails
    })
        .from(drafts)
        .innerJoin(emails, eq(drafts.emailId, emails.id))
        .where(and(eq(emails.userId, session.user.id), eq(drafts.status, 'pending_approval')));

    const recentInvoices = await db.select({
        invoice: invoices,
        email: emails
    })
        .from(invoices)
        .innerJoin(emails, eq(invoices.emailId, emails.id))
        .where(eq(emails.userId, session.user.id))
        .orderBy(desc(invoices.createdAt))
        .limit(10);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <SyncButton />
                    <span>{session.user.email}</span>
                    <SignOutButton />
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Urgent / Drafts Section */}
                <section className="col-span-1 lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-orange-200">
                    <h2 className="text-xl font-semibold mb-4 text-orange-700">Action Required: Draft Approvals</h2>
                    {pendingDrafts.length === 0 ? (
                        <p className="text-gray-500">No pending drafts.</p>
                    ) : (
                        <DraftApprovalList items={pendingDrafts} />
                    )}
                </section>

                {/* Invoices */}
                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">Recent Invoices</h2>
                    <ul className="space-y-3">
                        {recentInvoices.map(({ invoice, email }) => (
                            <li key={invoice.id} className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">{invoice.vendorName || "Unknown Vendor"}</span>
                                    <span className="font-bold">{invoice.currency} {invoice.amount}</span>
                                </div>
                                <div className="text-sm text-gray-500">Due: {invoice.dueDate ? invoice.dueDate.toLocaleDateString() : 'N/A'}</div>
                            </li>
                        ))}
                        {recentInvoices.length === 0 && <li className="text-gray-500">No invoices found.</li>}
                    </ul>
                </section>

                {/* Recent Emails */}
                <section className="col-span-1 lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Emails</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-gray-500 text-sm">
                                    <th className="py-2">Category</th>
                                    <th className="py-2">Subject</th>
                                    <th className="py-2">Date</th>
                                    <th className="py-2">Processed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentEmails.map(email => (
                                    <tr key={email.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold
                                       ${email.category === 'urgent' ? 'bg-red-100 text-red-800' :
                                                    email.category === 'invoice' ? 'bg-blue-100 text-blue-800' :
                                                        email.category === 'client' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }
`}>
                                                {email.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="py-2 font-medium text-gray-900 truncate max-w-xs">{email.subject}</td>
                                        <td className="py-2 text-gray-500 text-sm">{email.receivedAt.toLocaleDateString()}</td>
                                        <td className="py-2 text-center">{email.isProcessed ? '✅' : '⏳'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

"use client";

export const runtime = 'edge';

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, Users, Reply } from "lucide-react";
import { format } from "date-fns";
import { GmailEmailDetail } from "@/lib/gmail";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, error, isLoading } = useSWR<{ email: GmailEmailDetail }>(
    id ? `/api/emails/${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-32 w-full bg-muted rounded mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.email) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <div className="text-destructive text-lg font-medium mb-2">
              Unable to load email
            </div>
            <p className="text-muted-foreground">
              {error?.message || "Email not found or has been deleted."}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              Return to inbox
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const email = {
    ...data.email,
    receivedAt: new Date(data.email.receivedAt),
  };

  const parseSenderName = (sender: string) => {
    if (!sender) return "Unknown";
    const match = sender.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
    if (match) {
      let name: string;
      if (match[3]) {
        name = match[3];
      } else {
        name = match[1].trim();
      }
      return name.replace(/^"(.+)"$/, "$1");
    }
    return sender;
  };

  const extractEmail = (sender: string) => {
    const match = sender.match(/<(.+?)>/);
    return match ? match[1] : sender;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Email Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground mb-4">
              {email.subject || "(No Subject)"}
            </h1>

            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ">
                <span className="text-primary font-medium text-sm">
                  {parseSenderName(email.sender).charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Sender Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">
                    {parseSenderName(email.sender)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    &lt;{extractEmail(email.sender)}&gt;
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  to {parseSenderName(email.recipient)}
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-muted-foreground">
                {format(email.receivedAt, "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>

            {/* Additional recipients */}
            {(email.cc || email.replyTo) && (
              <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                {email.cc && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Cc:</span>
                    <span>{email.cc}</span>
                  </div>
                )}
                {email.replyTo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Reply className="w-4 h-4" />
                    <span className="font-medium">Reply-To:</span>
                    <span>{email.replyTo}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6">
            {email.htmlBody ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert bg-white dark:bg-gray-50 rounded p-4 text-gray-900"
                dangerouslySetInnerHTML={{ __html: email.htmlBody }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {email.body || email.snippet || "No content available."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

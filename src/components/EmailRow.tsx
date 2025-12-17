"use client";

import { useRouter } from "next/navigation";
import { format, isToday } from "date-fns";
import { GmailEmail } from "@/lib/gmail";

interface EmailRowProps {
  email: GmailEmail;
}

export function EmailRow({ email }: EmailRowProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/email/${email.gmailId}`);
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

  const name = parseSenderName(email.sender || "");

  return (
    <div
      onClick={handleClick}
      className="hover:bg-muted/40 rounded-md cursor-pointer p-2"
    >
      <div className="">
        <p className="text-sm text-foreground">{name || "-"}</p>
        <p className="text-sm text-muted-foreground">
          {email.subject || "(No Subject)"}
        </p>
      </div>

      <div className="flex-1 text-muted-foreground text-sm">
        {isToday(email.receivedAt)
          ? format(email.receivedAt, "h:mm a")
          : format(email.receivedAt, "d MMM")}
      </div>
    </div>
  );
}

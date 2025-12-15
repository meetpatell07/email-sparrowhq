
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">AI Email Assistant</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        Connect your Gmail and let AI organize your inbox, extract invoices, and draft replies.
      </p>

      {/* 
        This is a client-side interaction typically, but for MVP we can just link to a client component or use a button that triggers auth.
        We will use a simple client component wrapper or just a link if we had a dedicated sign-in page. 
        Better Auth usually works with client side call 'signIn.social(...)'.
      */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="mb-4 text-center">Get started by modifying the code to add a Sign In button.</p>
        {/* We need a client component for the button */}
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go to Login
        </Link>
      </div>
    </div>
  );
}

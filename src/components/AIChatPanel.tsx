"use client";

import { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    MailSend01Icon,
    Loading03Icon,
    Calendar01Icon,
    Mail01Icon,
    PlusSignIcon,
} from "@hugeicons/core-free-icons";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const quickActions = [
    { icon: Calendar01Icon, label: "Today's events", command: "What's on my calendar today?" },
    { icon: Mail01Icon, label: "Draft reply", command: "Draft a reply for the latest urgent email" },
    { icon: PlusSignIcon, label: "New event", command: "Create a meeting for tomorrow at 2pm" },
];

export function AIChatPanel() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! I can help you draft emails, check your calendar, and manage your inbox.\n\nTry: \"What's on my calendar today?\"",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.response || "I couldn't process that. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick actions */}
            <div className="px-4 py-3 border-b border-[#E7E5E4]">
                <p className="text-[11px] font-medium text-[#78716C] uppercase tracking-wider mb-2">Quick actions</p>
                <div className="flex flex-col gap-0.5">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => setInput(action.command)}
                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917] transition-colors text-left"
                        >
                            <HugeiconsIcon icon={action.icon} size={14} className="text-[#A8A29E] shrink-0" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                                message.role === "user"
                                    ? "bg-[#1C1917] text-white rounded-[6px] rounded-br-[2px]"
                                    : "bg-[#F5F5F4] text-[#1C1917] rounded-[6px] rounded-bl-[2px]"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#F5F5F4] rounded-[6px] rounded-bl-[2px] px-3.5 py-2.5">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin text-[#78716C]" />
                                <span className="text-[13px] text-[#78716C]">Thinking…</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-[#E7E5E4]">
                <div className="flex items-center gap-2 bg-[#F5F5F4] rounded-md px-3 py-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything…"
                        className="flex-1 bg-transparent text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-6 h-6 bg-[#1C1917] rounded-md flex items-center justify-center disabled:opacity-30 transition-opacity shrink-0"
                        aria-label="Send"
                    >
                        <HugeiconsIcon icon={MailSend01Icon} size={12} className="text-white" />
                    </button>
                </div>
            </form>
        </div>
    );
}

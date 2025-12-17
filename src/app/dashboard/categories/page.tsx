"use client";

import { Sidebar } from "@/components/Sidebar";
import { Tag, CheckCircle } from "lucide-react";

const categories = [
    { name: "Personal", color: "bg-blue-100 text-blue-700", description: "Personal emails and correspondence" },
    { name: "Invoice", color: "bg-green-100 text-green-700", description: "Bills, receipts, and payment requests" },
    { name: "Client", color: "bg-purple-100 text-purple-700", description: "Communications from clients" },
    { name: "Urgent", color: "bg-red-100 text-red-700", description: "Emails requiring immediate attention" },
    { name: "Marketing", color: "bg-pink-100 text-pink-700", description: "Newsletters and promotional content" },
    { name: "Notification", color: "bg-yellow-100 text-yellow-700", description: "Automated updates and alerts" },
];

export default function CategoriesPage() {
    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-black">Categorization</h1>
                </header>
                <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Categories</h2>
                            <p className="text-gray-500 text-sm">
                                AI automatically categorizes your emails using these labels.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">
                                        Automatic Classification
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        When you sync emails, AI analyzes content and assigns one of the categories below.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div
                                    key={category.name}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${category.color}`}>
                                            {category.name}
                                        </span>
                                        <span className="text-sm text-gray-500">{category.description}</span>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500 text-center">
                                Categories are automatically applied during email sync. No manual setup needed.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

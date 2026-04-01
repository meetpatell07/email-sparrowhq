"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, PlusSignIcon, Loading02Icon } from "@hugeicons/core-free-icons";

export function DriveFilesTab() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDrafting, setIsDrafting] = useState(false);
    const [draftFile, setDraftFile] = useState<any | null>(null);
    const [instructions, setInstructions] = useState("");
    const [recipient, setRecipient] = useState("");

    useEffect(() => {
        fetch("/api/drive")
            .then(res => res.json())
            .then(data => {
                if (data.files) {
                    setFiles(data.files);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleCreateDraft = async () => {
        if (!draftFile || !instructions || !recipient) return;
        setIsDrafting(true);
        try {
            const res = await fetch("/api/drafts/from-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId: draftFile.id, instructions, recipient })
            });
            if (res.ok) {
                alert("AI Draft built and saved to Gmail Drafts!");
                setDraftFile(null);
                setInstructions("");
                setRecipient("");
            } else {
                alert("Failed to create draft");
            }
        } catch {
            alert("Error constructing AI draft");
        } finally {
            setIsDrafting(false);
        }
    };

    if (loading) {
        return <div className="text-[#A8A29E] text-[13px] flex items-center gap-2 mt-8">
            <HugeiconsIcon icon={Loading02Icon} size={14} className="animate-spin" />
            Fetching your Drive documents...
        </div>;
    }

    return (
        <div className="space-y-4">
            {/* Modal */}
            {draftFile && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg border border-[#E7E5E4]">
                        <h3 className="text-[18px] font-semibold text-[#1C1917] mb-1">Create AI Draft</h3>
                        <p className="text-[13px] text-[#A8A29E] mb-6">Attaching '{draftFile.name}'</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-[#78716C] mb-1">Send To (Email Address)</label>
                                <input type="email" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="client@company.com" className="w-full h-10 px-3 rounded-lg border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#78716C] mb-1">Draft Instructions</label>
                                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Briefly explain what the attached document is..." className="w-full h-24 p-3 rounded-lg border border-[#E7E5E4] bg-white text-[14px] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917] resize-none" />
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <button onClick={() => setDraftFile(null)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#78716C] hover:bg-[#F5F5F4] transition-colors">Cancel</button>
                                <button onClick={handleCreateDraft} disabled={isDrafting || !recipient || !instructions} className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-[#1C1917] hover:bg-[#292524] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isDrafting ? "Drafting..." : "Generate & Attach"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                {files.map((file) => (
                    <div key={file.id} className="group border border-[#E7E5E4] rounded-lg p-3 hover:border-[#D6D3D1] transition-all bg-white shadow-sm hover:shadow-md flex flex-col justify-between h-24 relative">
                        <div>
                            <div className="flex items-start justify-between mb-1.5">
                                <img src={file.iconLink || "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"} alt="Icon" className="w-4 h-4 object-contain" />
                                <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} className="text-[#A8A29E] hover:text-[#1C1917]" />
                                </a>
                            </div>
                            <h3 className="text-[12px] font-medium text-[#1C1917] line-clamp-2 leading-snug">
                                {file.name}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-2">
                            <span className="text-[10px] text-[#A8A29E]">
                                {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ""}
                            </span>
                            <button
                                onClick={() => setDraftFile(file)}
                                className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#F5F5F4] text-[#1C1917] hover:bg-[#E7E5E4] text-[9px] font-bold uppercase tracking-wider transition-colors"
                            >
                                <HugeiconsIcon icon={PlusSignIcon} size={9} />
                                Select
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {files.length === 0 && !loading && (
                <div className="p-8 text-center text-[13px] text-[#A8A29E]">
                    No files found in Google Drive. Ensure you've re-authenticated to grant Drive access.
                </div>
            )}
        </div>
    );
}

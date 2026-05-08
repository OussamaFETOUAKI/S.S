"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import {
    fetchIncidents,
    updateIncidentStatus,
    deleteIncident,
    Incident,
} from "@/lib/api";
import Link from "next/link";

export default function AdminHistory() {
    const { user: adminUser } = useAuth();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [notif, setNotif] = useState<string | null>(null);

    useEffect(() => {
        if (adminUser?.role !== 'ROLE_ADMIN') return;
        loadData();
    }, [adminUser]);

    async function loadData() {
        try {
            const incData = await fetchIncidents();
            // Only keep resolved
            setIncidents(incData.filter(i => i.status === 'RESOLVED'));
        } catch (err) { console.error("Access error:", err); } finally { setLoading(false); }
    }

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateIncidentStatus(id, status);
            setNotif("SAVED");
            loadData();
            if (selectedIncident?.id === id) {
                if (status !== 'RESOLVED') {
                    setSelectedIncident(null);
                } else {
                    const updated = (await fetchIncidents()).find(i => i.id === id);
                    if (updated) setSelectedIncident(updated);
                }
            }
            setTimeout(() => setNotif(null), 3000);
        } catch { setNotif("ERROR"); }
    };

    const getDelayDays = (createdAt: string) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - created.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const openInMaps = (inc: Incident) => {
        const url = inc.latitude && inc.longitude
            ? `https://www.google.com/maps/dir/?api=1&destination=${inc.latitude},${inc.longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inc.location)}`;
        window.open(url, "_blank");
    };

    if (adminUser?.role !== 'ROLE_ADMIN') return null;

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <Navbar />

            {notif && (
                <div className="fixed top-24 right-4 z-[9999] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase text-xs tracking-widest">
                    {notif}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-4 h-4 rounded-full bg-slate-500 shadow-[0_0_15px_#64748b]"></span>
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">History Panel</h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">RESOLVED INCIDENTS ARCHIVE</p>
                    </div>
                </div>


                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                        <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Finished Reports</span>
                            <div className="flex gap-2">
                                <Link href="/admin" className="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all bg-slate-950 text-slate-600 hover:text-white flex items-center">
                                    Back to Live Feed
                                </Link>
                                <button className="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all bg-sky-500 text-white shadow-lg">
                                    Resolved
                                </button>
                            </div>
                        </div>

                        {loading ? <div className="py-20 text-center font-black animate-pulse text-slate-700 tracking-[0.5em]">LOADING...</div> : (
                            <div className="grid gap-4">
                                {incidents.length === 0 && (
                                    <div className="text-center py-10 text-slate-500 font-bold text-sm">No resolved reports found.</div>
                                )}
                                {incidents.map((inc) => (
                                    <div key={inc.id} onClick={() => setSelectedIncident(inc)} className={`glass relative rounded-[2.5rem] p-6 border transition-all cursor-pointer group ${selectedIncident?.id === inc.id ? "border-sky-500 bg-sky-500/5" : "border-white/5 hover:border-white/10"}`}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-2xl relative">
                                                {inc.imageUrl ? <img src={inc.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-900" />}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-none">{inc.title}</h3>
                                                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1.5 line-clamp-1">LOCATION: {inc.location}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xl font-black italic tracking-tighter ${inc.urgencyScore >= 70 ? "text-red-500" : inc.urgencyScore >= 40 ? "text-amber-500" : "text-emerald-500"}`}>
                                                            {inc.urgencyScore ?? 0}%
                                                        </p>
                                                        <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.2em]">Urgency</p>
                                                    </div>
                                                </div>

                                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-4 border border-white/5">
                                                    <div className={`h-full transition-all duration-1000 ${inc.urgencyScore >= 70 ? "bg-red-500" : inc.urgencyScore >= 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${inc.urgencyScore ?? 0}%` }}></div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-4 h-4 rounded-full bg-slate-800 overflow-hidden">
                                                            {inc.creator?.profilePicture && <img src={inc.creator.profilePicture} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{inc.creator?.fullName || "User"}</span>
                                                    </div>
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">RESOLVED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-12 xl:col-span-5 sticky top-28">
                        {selectedIncident ? (
                            <div className="glass rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl">
                                <div className="h-40 relative">
                                    {selectedIncident.imageUrl ? <img src={selectedIncident.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-900 text-[10px] font-black uppercase text-slate-700 tracking-widest">No Image</div>}
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="bg-sky-500/10 border border-sky-500/20 p-6 rounded-[2rem] relative">
                                        <span className="absolute -top-3 left-6 bg-sky-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">AI Suggestion</span>
                                        <p className="text-sky-100 text-sm font-bold italic leading-relaxed">{selectedIncident.assistantMessage || "No suggestions yet."}</p>
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{selectedIncident.title}</h2>
                                        <p className="text-slate-500 text-sm mt-2 font-medium">{selectedIncident.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-900 border border-white/5 text-center rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">What to do?</p>
                                            <p className="text-[10px] font-black text-sky-400 uppercase truncate">{selectedIncident.suggestedAction || "Analyzing..."}</p>
                                        </div>
                                        <button onClick={() => openInMaps(selectedIncident)} className="flex items-center justify-center bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                                            Map Location
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-2">Update Status</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <StatusBtn active={selectedIncident.status === 'PENDING'} label="Stop" onClick={() => handleStatusUpdate(selectedIncident.id, 'PENDING')} />
                                            <StatusBtn active={selectedIncident.status === 'IN_PROGRESS'} label="Start" onClick={() => handleStatusUpdate(selectedIncident.id, 'IN_PROGRESS')} />
                                            <StatusBtn active={selectedIncident.status === 'RESOLVED'} label="Finish" onClick={() => handleStatusUpdate(selectedIncident.id, 'RESOLVED')} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (confirm("Delete this report forever?")) {
                                                deleteIncident(selectedIncident.id).then(() => { setNotif("DELETED"); loadData(); setSelectedIncident(null); });
                                            }
                                        }}
                                        className="w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-2xl"
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="glass h-[500px] rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Pick a report to see details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBtn({ label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? "bg-sky-500 text-white shadow-xl" : "bg-slate-900 text-slate-500 border border-white/5 hover:text-white hover:border-white/10"}`}>
            {label}
        </button>
    );
}

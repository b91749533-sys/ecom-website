"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Settings, 
  Plus, 
  Trash2, 
  X,
  ShieldCheck,
  History,
  Users,
  Eye,
  Calendar,
  Terminal,
  UserPlus
} from "lucide-react";

interface Staff {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
  userName: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function SettingsView() {
  const { user } = useAuth();
  
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination for audit logs
  const [logLimit] = useState(50);
  const [logOffset, setLogOffset] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);

  // New staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("support");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // View raw details state
  const [viewLogDetail, setViewLogDetail] = useState<AuditLog | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, logsRes] = await Promise.all([
        fetch("/api/settings/staff"),
        fetch(`/api/settings/audit-logs?limit=${logLimit}&offset=${logOffset}`),
      ]);

      const staffData = await staffRes.json();
      const logsData = await logsRes.json();

      if (staffData.success) setStaffList(staffData.staff);
      if (logsData.success) {
        setAuditLogs(logsData.logs);
        setTotalLogs(logsData.total);
      }
    } catch (err) {
      console.error("Failed to fetch settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [logOffset]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    try {
      const res = await fetch("/api/settings/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          password: staffPassword,
          role: staffRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowStaffModal(false);
        setStaffName("");
        setStaffEmail("");
        setStaffPassword("");
        setStaffRole("support");
        fetchData();
      } else {
        setCreateError(data.error || "Failed to create staff user.");
      }
    } catch (err) {
      console.error("Failed to create staff user:", err);
      setCreateError("Connection error. Try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this staff member's credentials?")) return;
    try {
      const res = await fetch(`/api/settings/staff?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete staff user:", err);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center">
        <ShieldCheck className="h-12 w-12 text-crimson-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Access Restrained</h3>
        <p className="text-xs text-slate-500 mt-2">Only administrator staff hold permissions to access system configs and audit records.</p>
      </div>
    );
  }

  if (loading && staffList.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-medium">Querying System logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Staff Management panel */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gold-400" />
                Staff Access Control
              </h4>
              <button
                onClick={() => setShowStaffModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-850 text-[10px] font-bold text-gold-400 border border-slate-800 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Staff
              </button>
            </div>

            <div className="space-y-4">
              {staffList.map((staff) => (
                <div key={staff.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 flex justify-between items-center">
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold text-slate-200 truncate pr-2">
                      {staff.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate pr-2">
                      {staff.email} • <span className="capitalize text-gold-500">{staff.role}</span>
                    </p>
                  </div>
                  {staff.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="text-slate-600 hover:text-crimson-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-850 text-[10px] text-slate-500 leading-relaxed">
            Role-Based Access Control restricts features:
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-500">
              <li><strong className="text-slate-400">Admin</strong>: Unrestrained database/system controls.</li>
              <li><strong className="text-slate-400">Manager</strong>: Complete read logs, analytics, marketing.</li>
              <li><strong className="text-slate-400">Support</strong>: Client detail updates, tracking inputs.</li>
            </ul>
          </div>
        </div>

        {/* Chronological Audit logs */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans mb-4 flex items-center gap-1.5">
            <History className="h-4 w-4 text-gold-400" />
            Chronological Audit Trail
          </h4>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-8">No audit logs registered.</p>
            ) : (
              auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-4 p-3 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors cursor-pointer"
                  onClick={() => setViewLogDetail(log)}
                >
                  <Terminal className="h-4 w-4 text-slate-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1 truncate pr-4">{log.details}</p>
                    <div className="flex gap-3 text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                      <span>Agent: {log.userName || "System"}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination controls */}
          {totalLogs > logLimit && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-850 text-xs text-slate-500">
              <span>Showing {logOffset + 1}-{Math.min(logOffset + logLimit, totalLogs)} of {totalLogs} logs</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLogOffset(Math.max(0, logOffset - logLimit))}
                  disabled={logOffset === 0}
                  className="px-3 py-1 bg-slate-850 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-40"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setLogOffset(logOffset + logLimit)}
                  disabled={logOffset + logLimit >= totalLogs}
                  className="px-3 py-1 bg-slate-850 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Audit Log raw Detail Modal */}
      {viewLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewLogDetail(null)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Audit Record Details
              </h4>
              <button onClick={() => setViewLogDetail(null)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 text-xs space-y-3.5 leading-relaxed">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Operation Action</span>
                <span className="text-sm font-bold text-white">{viewLogDetail.action}</span>
              </div>
              
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Execution Timestamp</span>
                <span className="text-slate-300">{new Date(viewLogDetail.createdAt).toString()}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Staff Agent</span>
                <span className="text-slate-300">{viewLogDetail.userName}</span>
              </div>

              {viewLogDetail.ipAddress && (
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Client IP Address</span>
                  <span className="text-slate-300 font-mono">{viewLogDetail.ipAddress}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-850">
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Details & Diff payload</span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-slate-400 text-[11px] whitespace-pre-wrap break-all leading-normal">
                  {viewLogDetail.details}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewLogDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff user creation modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStaffModal(false)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col z-50 shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Register Staff Access
              </h4>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              {createError && (
                <div className="rounded-lg bg-crimson-600/10 border border-crimson-500/20 p-3 text-xs text-crimson-400">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Staff Member Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="E.g., Alice Smith"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="alice.smith@lumiere-crm.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Secure Password *
                </label>
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/40"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Authorization Role
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-gold-500/40 cursor-pointer"
                >
                  <option value="support">Support Agent (Restricted edits)</option>
                  <option value="manager">Manager (Read & Marketing)</option>
                  <option value="admin">Administrator (Unrestricted)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-xs font-semibold text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? "Registering..." : "Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Chatbot from "../Chatbot";
import NotificationBell from "../NotificationBell";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import {
  Wrench, Loader, CheckCircle, Clock, AlertCircle, AlertTriangle,
  Phone, MapPin, Building, User, LogOut, ChevronDown, ChevronUp,
  Play, CheckCheck,
} from "lucide-react";

const TechDashboard = () => {
  const { c, isDark } = useTheme();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        api.get("maintenance/"),
        api.get("technician/stats/"),
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      const payload = { status: newStatus };
      if (notes.trim()) payload.resolution_notes = notes;
      await api.patch("maintenance/" + ticketId + "/", payload);
      setNotes("");
      setExpandedTicket(null);
      fetchData();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update ticket.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "EMERGENCY": return { bg: c.redBg, badge: c.redBg + " animate-pulse" };
      case "HIGH": return { bg: c.yellowBg, badge: c.yellowBg };
      case "MEDIUM": return { bg: c.blueBg, badge: c.blueBg };
      default: return { bg: c.card + " " + c.border, badge: c.btn2 };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED": case "CLOSED": return <CheckCircle size={16} className={c.green} />;
      case "IN_PROGRESS": return <Clock size={16} className={c.yellow} />;
      case "OPEN": return <AlertCircle size={16} className={c.blue} />;
      default: return <Clock size={16} className={c.textMut} />;
    }
  };

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) return (
    <div className={"min-h-screen flex items-center justify-center " + c.bg}>
      <Loader className={"animate-spin " + c.accent} size={48} />
    </div>
  );

  return (
    <div className={"min-h-screen font-sans " + c.bg + " " + c.text}>
      {/* Header */}
      <header className={"border-b p-5 sticky top-0 z-10 " + c.card + " " + c.border}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl shadow-lg shadow-amber-500/20">
              <Wrench className="text-white" size={22} />
            </div>
            <div>
              <h1 className={"text-lg font-bold " + c.heading}>
                PropAI <span className={c.accent}>Technician</span>
              </h1>
              <p className={"text-xs " + c.textMut}>Maintenance Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <button onClick={handleLogout} className={c.textMut + " hover:text-rose-400 p-2 transition"}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-5 space-y-5 fade-in">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Open", val: stats.open, color: c.blue },
              { label: "In Progress", val: stats.in_progress, color: c.yellow },
              { label: "Resolved", val: stats.resolved, color: c.green },
              { label: "Urgent", val: stats.emergency + stats.high, color: c.red },
            ].map((s, i) => (
              <div key={i} className={"rounded-xl p-4 border text-center " + c.card + " " + c.border}>
                <p className={"text-2xl font-extrabold " + s.color}>{s.val}</p>
                <p className={"text-[10px] uppercase font-bold " + c.textMut}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Banner */}
        {stats && stats.emergency > 0 && (
          <div className={"p-4 rounded-2xl flex items-center gap-3 animate-pulse border " + c.redBg}>
            <AlertTriangle size={24} className={c.red + " shrink-0"} />
            <p className={"font-bold " + c.heading}>
              {"🚨 " + stats.emergency + " Emergency Ticket" + (stats.emergency > 1 ? "s" : "") + " — Needs Immediate Attention!"}
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => {
            const count = status === "ALL" ? tickets.length : tickets.filter((t) => t.status === status).length;
            if (count === 0 && status !== "ALL") return null;
            return (
              <button key={status} onClick={() => setFilter(status)}
                className={"px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border " +
                  (filter === status ? c.btn : c.btn2)}>
                {status.replace("_", " ") + " (" + count + ")"}
              </button>
            );
          })}
        </div>

        {/* Ticket List */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((ticket) => {
              const style = getPriorityStyle(ticket.priority);
              const isExpanded = expandedTicket === ticket.id;

              return (
                <div key={ticket.id} className={"rounded-xl border overflow-hidden transition-all " + style.bg}>
                  {/* Ticket Header */}
                  <div className="p-4 cursor-pointer" onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(ticket.status)}
                        <h3 className={"font-semibold text-sm truncate " + c.heading}>{ticket.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={"px-2 py-1 rounded-md text-[10px] font-bold border " + style.badge}>{ticket.priority}</span>
                        {isExpanded ? <ChevronUp size={16} className={c.textMut} /> : <ChevronDown size={16} className={c.textMut} />}
                      </div>
                    </div>
                    <div className={"flex items-center gap-4 text-xs " + c.textSec}>
                      <span className="flex items-center gap-1"><Building size={12} /> {ticket.property_name} — Unit {ticket.unit_number}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className={"border-t p-4 space-y-4 " + c.border + " " + (isDark ? "bg-black/20" : "bg-gray-50/50")}>
                      <div>
                        <p className={"text-[10px] uppercase font-bold mb-1 " + c.textMut}>Description</p>
                        <p className={"text-sm " + c.textSec}>{ticket.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className={"p-3 rounded-xl border " + c.card + " " + c.border}>
                          <p className={"text-[10px] uppercase font-bold mb-1 " + c.textMut}>Location</p>
                          <p className={"text-sm flex items-center gap-1 " + c.heading}><MapPin size={12} className={c.accent} /> {ticket.property_name}</p>
                          <p className={"text-xs ml-4 " + c.textSec}>Unit {ticket.unit_number}</p>
                          {ticket.property_address && <p className={"text-xs ml-4 mt-1 " + c.textMut}>{ticket.property_address}</p>}
                        </div>
                        <div className={"p-3 rounded-xl border " + c.card + " " + c.border}>
                          <p className={"text-[10px] uppercase font-bold mb-1 " + c.textMut}>Tenant Contact</p>
                          <p className={"text-sm flex items-center gap-1 " + c.heading}><User size={12} className={c.green} /> {ticket.tenant_name || "N/A"}</p>
                          {ticket.tenant_phone && (
                            <a href={"tel:" + ticket.tenant_phone} className={"text-xs ml-4 flex items-center gap-1 mt-1 " + c.accent}>
                              <Phone size={10} /> {ticket.tenant_phone}
                            </a>
                          )}
                        </div>
                      </div>

                      {ticket.image && (
                        <div>
                          <p className={"text-[10px] uppercase font-bold mb-1 " + c.textMut}>Photo Evidence</p>
                          <img src={"http://localhost:8000" + ticket.image} alt="Issue"
                            className={"w-full max-h-48 object-cover rounded-xl border " + c.border} />
                        </div>
                      )}

                      <div className="flex gap-2">
                        {ticket.ai_category && ticket.ai_category !== "GENERAL" && (
                          <span className={"px-2 py-1 rounded text-[10px] font-bold border " + c.purpleBg}>{"🔧 " + ticket.ai_category}</span>
                        )}
                        {ticket.source === "SYSTEM" && (
                          <span className={"px-2 py-1 rounded text-[10px] font-bold border " + c.purpleBg}>🤖 AI Triaged</span>
                        )}
                      </div>

                      {ticket.resolution_notes && (
                        <div className={"p-3 rounded-xl border " + c.greenBg}>
                          <p className={"text-[10px] uppercase font-bold mb-1 " + c.green}>Resolution Notes</p>
                          <p className={"text-sm " + c.textSec}>{ticket.resolution_notes}</p>
                        </div>
                      )}

                      {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
                        <div className="space-y-3 pt-2">
                          <textarea placeholder="Add notes (optional)..."
                            value={expandedTicket === ticket.id ? notes : ""}
                            onChange={(e) => setNotes(e.target.value)}
                            className={"w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none " + c.input + " " + c.text}
                            rows={2} />
                          <div className="flex gap-2">
                            {ticket.status === "OPEN" && (
                              <button onClick={() => handleStatusUpdate(ticket.id, "IN_PROGRESS")}
                                disabled={updatingId === ticket.id}
                                className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm shadow-lg shadow-amber-500/20">
                                <Play size={14} /> Start Working
                              </button>
                            )}
                            {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                              <button onClick={() => handleStatusUpdate(ticket.id, "RESOLVED")}
                                disabled={updatingId === ticket.id}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm shadow-lg shadow-emerald-500/20">
                                <CheckCheck size={14} /> Mark Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
                        <div className={"p-3 rounded-xl border text-center " + c.greenBg}>
                          <CheckCircle size={20} className={c.green + " mx-auto mb-1"} />
                          <p className={c.green + " font-bold text-sm"}>
                            {ticket.status === "CLOSED" ? "Ticket Closed" : "Resolved"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className={"text-center py-16 border-2 border-dashed rounded-2xl " + c.border}>
              <Wrench size={48} className={c.textMut + " mx-auto mb-4"} />
              <p className={c.textMut + " font-medium"}>No tickets found.</p>
              <p className={"text-xs mt-1 " + c.textMut}>You're all caught up!</p>
            </div>
          )}
        </div>
      </main>

      <Chatbot />
    </div>
  );
};

export default TechDashboard;
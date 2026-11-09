import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Bot, UserRound, Send, Mic, AlertTriangle, Phone, ArrowLeft, Megaphone, CheckCircle2 } from "lucide-react";
import api from "../api/api";

const heading = { fontFamily: '"Space Grotesk", sans-serif' };
const body = { fontFamily: "Inter, system-ui, sans-serif" };

const STATUS = {
  needs_human: { label: "Needs you", cls: "bg-red-50 text-red-700 ring-red-200" },
  bot: { label: "Bot", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  human: { label: "You", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  resolved: { label: "Resolved", cls: "bg-zinc-100 text-zinc-500 ring-zinc-200" },
};

const TABS = [
  ["all", "All"],
  ["needs_human", "Needs you"],
  ["bot", "Bot"],
  ["human", "You"],
];

function Badge({ status }) {
  const s = STATUS[status];
  if (!s) return null;
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${s.cls}`}>{s.label}</span>;
}

function formatTime(value) {
  if (!value) return "";
  return `${new Intl.DateTimeFormat("en-PK", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value))} PKT`;
}

export default function WhatsAppInbox() {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  const fetchContacts = useCallback(async () => {
    const { data } = await api.get("/api/inbox/contacts", {
      params: { status: tab === "all" ? undefined : tab, q: query.trim() || undefined },
    });
    return data;
  }, [tab, query]);

  const fetchStats = useCallback(async () => {
    const { data } = await api.get("/api/inbox/stats");
    return data;
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([fetchContacts(), fetchStats()])
      .then(([contactsData, statsData]) => {
        if (active) {
          setContacts(contactsData);
          setStats(statsData);
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || err.response?.data?.error || "Could not load the WhatsApp inbox.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [fetchContacts, fetchStats]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    api.get(`/api/inbox/contacts/${selectedId}/messages`)
      .then(({ data }) => { if (active) setMessages(data); })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || err.response?.data?.error || "Could not load this conversation.");
      });
    return () => { active = false; };
  }, [selectedId]);

  useEffect(() => {
    const baseURL = api.defaults.baseURL || window.location.origin;
    const stream = new EventSource(`${baseURL}/api/inbox/stream`, { withCredentials: true });

    const onContact = (event) => {
      const contact = JSON.parse(event.data);
      setContacts((current) => {
        const index = current.findIndex((item) => item.id === contact.id);
        if (index === -1) return [contact, ...current];
        return current.map((item) => item.id === contact.id ? { ...item, ...contact } : item);
      });
    };
    const onMessage = (event) => {
      const { contact, message } = JSON.parse(event.data);
      setContacts((current) => {
        const index = current.findIndex((item) => item.id === contact.id);
        if (index === -1) return [contact, ...current];
        return current.map((item) => item.id === contact.id ? { ...item, ...contact } : item);
      });
      if (contact.id === selectedId) {
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      }
    };
    stream.addEventListener("contact", onContact);
    stream.addEventListener("message", onMessage);
    stream.onerror = () => setError("Live inbox updates disconnected. Reconnecting…");
    stream.onopen = () => setError("");
    return () => stream.close();
  }, [selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, messages.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setError("");
    try {
      const { data } = await api.post(`/api/inbox/contacts/${selected.id}/send`, { text });
      setMessages((current) => current.some((message) => message.id === data.id) ? current : [...current, data]);
      setDraft("");
      const [contactsData, statsData] = await Promise.all([fetchContacts(), fetchStats()]);
      setContacts(contactsData);
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Could not send the message.");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    setError("");
    try {
      const { data } = await api.post(`/api/inbox/contacts/${selected.id}/status`, { status });
      setContacts((current) => current.map((contact) => contact.id === data.id ? { ...contact, ...data } : contact));
      setStats(await fetchStats());
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Could not update conversation status.");
    }
  };

  const statItems = stats ? [
    ["Conversations today", stats.conversationsToday],
    ["Need you", stats.needsYou],
    ["Handled by bot", `${stats.botHandledPct}%`],
    ["Median first reply", stats.medianReplyMs == null ? "—" : `${(stats.medianReplyMs / 1000).toFixed(1)}s`],
  ] : [];
  const list = contacts;

  return (
    <div className="flex h-screen min-h-[600px] flex-col bg-zinc-50 text-zinc-900" style={body}>
      <header className="border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight" style={heading}>WhatsApp inbox</h1>
          <dl className="flex flex-wrap gap-x-6 gap-y-1">
            {statItems.map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dd className={`text-lg font-semibold ${label === "Need you" && value > 0 ? "text-red-600" : ""}`} style={heading}>{value}</dd>
                <dt className="text-xs text-zinc-500">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {error && <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">{error}</div>}

      <div className="flex min-h-0 flex-1">
        {/* Conversation list */}
        <aside className={`${selected ? "hidden md:flex" : "flex"} w-full flex-col border-r border-zinc-200 bg-white md:w-[360px]`}>
          <div className="space-y-3 p-3">
            <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
              <Search size={16} className="text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or number"
                className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </label>
            <div className="flex gap-1">
              {TABS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                    tab === key ? "bg-emerald-50 font-medium text-emerald-800" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {loading ? <li className="p-6 text-center text-sm text-zinc-500">Loading conversations…</li> : null}
            {!loading && list.length === 0 && (
              <li className="space-y-2 p-6 text-center text-sm text-zinc-500">
                <p>{query || tab !== "all" ? "No conversations match this filter." : "No WhatsApp conversations yet."}</p>
                {!query && tab === "all" && (
                  <p className="text-xs">
                    Set the Meta webhook to <code className="rounded bg-zinc-100 px-1">/api/whatsapp/agentWebhook</code>,
                    then send a message to your WhatsApp test number.
                  </p>
                )}
              </li>
            )}
            {list.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    if (c.id !== selectedId) {
                      setSelectedId(c.id);
                      setMessages([]);
                    }
                    setError("");
                  }}
                  className={`flex w-full items-start gap-3 border-b border-l-4 border-b-zinc-100 px-3 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600 ${
                    c.status === "needs_human" ? "border-l-red-500" : "border-l-transparent"
                  } ${selectedId === c.id ? "bg-emerald-50/60" : ""}`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600" style={heading}>
                    {c.name.replace("+", "").charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      <span className="shrink-0 text-xs text-zinc-400">{formatTime(c.lastMessageAt)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-zinc-500">{c.preview || "No messages yet"}</span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <Badge status={c.status} />
                      <span className="truncate text-xs text-zinc-400">{c.ad}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Thread */}
        <section className={`${selected ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
          {!selected ? (
            <div className="m-auto max-w-xs text-center">
              {loading ? <p className="text-sm text-zinc-500">Loading inbox…</p> : null}
              <p className="font-medium" style={heading}>Select a conversation</p>
              <p className="mt-1 text-sm text-zinc-500">Chats marked "Needs you" are waiting for a person to step in.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
                <button onClick={() => { setSelectedId(null); setMessages([]); }} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 md:hidden" aria-label="Back to list">
                  <ArrowLeft size={18} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold" style={heading}>{selected.name}</h2>
                    <Badge status={selected.status} />
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Phone size={12} />{selected.phone}</span>
                    <span className="flex items-center gap-1"><Megaphone size={12} />{selected.ad}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {selected.status === "human" ? (
                    <button onClick={() => updateStatus("bot")} className="flex items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                      <Bot size={15} /> Return to bot
                    </button>
                  ) : selected.status !== "resolved" ? (
                    <button onClick={() => updateStatus("human")} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700">
                      <UserRound size={15} /> Take over
                    </button>
                  ) : null}
                  {selected.status !== "resolved" && (
                    <button onClick={() => updateStatus("resolved")} className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                      <CheckCircle2 size={15} /> Resolve
                    </button>
                  )}
                </div>
              </div>

              {selected.status === "needs_human" && selected.flag && (
                <div className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>{selected.flag}</p>
                </div>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto bg-emerald-50/40 px-4 py-4">
                {messages.map((m) => {
                  const mine = m.from !== "customer";
                  const tone = m.from === "staff" ? "bg-zinc-900 text-white" : m.from === "bot" ? "border border-emerald-200 bg-white" : "border border-zinc-200 bg-white";
                  return (
                    <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <span className="mb-1 text-[11px] text-zinc-400">
                        {m.from === "customer" ? selected.name : m.from === "bot" ? "Bot" : "You"} · {formatTime(m.time)}
                      </span>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed md:max-w-[65%] ${tone}`}>
                        {!m.text ? (
                          <span className="flex items-center gap-2 text-zinc-500"><Mic size={15} /> {m.type === "audio" ? "Voice note (not processed)" : `${m.type} message (not displayed)`}</span>
                        ) : (
                          m.text
                        )}
                      </div>
                      {m.tools && (
                        <div className="mt-1 flex flex-wrap justify-end gap-1">
                          {m.tools.map((t) => (
                            <span key={t} className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 ring-1 ring-zinc-200">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="border-t border-zinc-200 bg-white p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={1}
                    placeholder={selected.status === "bot" ? "Reply as staff. The bot will pause for this chat." : "Type a reply"}
                    className="max-h-32 flex-1 resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim() || sending}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:bg-zinc-200 disabled:text-zinc-400"
                    aria-label="Send reply"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
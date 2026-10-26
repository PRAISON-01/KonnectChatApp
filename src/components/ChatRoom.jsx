import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, deleteMessage, leaveRoom } from '../features/room/roomSlice';

const POLL_MS = 3000;

// The server sends UTC with no timezone label, e.g. "2026-10-25T08:38:14.45".
// Read it as UTC, then show it in the viewer's own timezone (UTC+1 in Lagos).
const parse = (t) => {
  const s = String(t).replace(/(\.\d{3})\d+/, '$1'); // Java sends up to 9 fractional digits
  return new Date(/([zZ]|[+-]\d{2}:?\d{2})$/.test(s) ? s : `${s}Z`);
};
const time = (t) => {
  if (!t) return '';
  const d = parse(t);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export default function ChatRoom() {
  const dispatch = useDispatch();
  const { code, messages, error } = useSelector((s) => s.room);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState(null); // message showing "Delete? Yes / No"
  const [activeId, setActiveId] = useState(null);   // message whose trash icon was revealed by a tap (touch screens)
  const [leavingId, setLeavingId] = useState(null); // message sliding away
  const endRef = useRef(null);

  // The backend has no push channel, so poll for new messages.
  useEffect(() => {
    dispatch(fetchMessages());
    const id = setInterval(() => dispatch(fetchMessages()), POLL_MS);
    return () => clearInterval(id);
  }, [dispatch, code]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    dispatch(sendMessage(t));
    setText('');
  };

  const remove = (id) => {
    setConfirmId(null);
    setActiveId(null);
    setLeavingId(id); // slide it out first...
    setTimeout(() => {
      // ...then delete. If the server refuses, the message slides back in.
      dispatch(deleteMessage(id)).unwrap().catch(() => {}).finally(() => setLeavingId(null));
    }, 200);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col p-3">
      <header className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs text-muted">Room code</p>
          <button onClick={copy} className="font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-ink" title="Copy code">
            {code} <span className="ml-1 text-xs font-normal text-muted">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <button onClick={() => dispatch(leaveRoom())} className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium hover:bg-paper focus:outline-none focus:ring-2 focus:ring-ink">
          Leave room
        </button>
      </header>

      <div className="my-3 flex-1 space-y-2 overflow-y-auto rounded-xl border border-line bg-white/70 p-4">
        {messages.length === 0 && <p className="pt-6 text-center text-sm text-muted">No messages yet. Share the code and say hello.</p>}
        {messages.map((m) => {
          const confirming = confirmId === m.id;
          const revealed = activeId === m.id;
          const leaving = leavingId === m.id;
          return (
            <div
              key={m.id}
              className={`flex transition-all duration-200 ease-out ${m.mine ? 'justify-end' : 'justify-start'} ${leaving ? 'translate-x-8 scale-95 opacity-0' : ''}`}
            >
              {/* "group" sits on this wrapper, so the trash icon appears when you hover the message itself */}
              <div className="group flex max-w-[85%] items-center gap-1.5">
                {m.mine &&
                  (confirming ? (
                    <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-red-200 bg-red-50 py-1 pl-3 pr-1 text-xs text-red-700">
                      <span>Delete?</span>
                      <button onClick={() => remove(m.id)} className="rounded-full px-2.5 py-1 font-semibold transition hover:bg-red-100 active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-400">
                        Yes
                      </button>
                      <button onClick={() => setConfirmId(null)} className="rounded-full px-2.5 py-1 transition hover:bg-red-100 active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-400">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(m.id)}
                      aria-label="Delete message"
                      className={`shrink-0 rounded-full p-2 text-muted transition duration-200 ease-out hover:bg-red-50 hover:text-red-600 active:scale-90 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-400 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 ${
                        revealed ? 'translate-x-0 scale-100 opacity-100' : 'pointer-events-none translate-x-1 scale-75 opacity-0'
                      }`}
                    >
                      <TrashIcon />
                    </button>
                  ))}

                <div
                  onClick={m.mine ? () => setActiveId(revealed ? null : m.id) : undefined}
                  className={`min-w-0 rounded-2xl px-4 py-2 text-sm transition duration-200 ${
                    m.mine ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md border border-line bg-white'
                  } ${confirming ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}
                >
                  {!m.mine && m.senderAlias && <p className="text-xs font-semibold text-muted">{m.senderAlias}</p>}
                  <p className="break-words">{m.content}</p>
                  <p className={`mt-0.5 text-right text-[11px] ${m.mine ? 'text-white/60' : 'text-muted'}`}>{time(m.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {error && <p role="alert" className="mb-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message"
          aria-label="Message"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/20"
        />
        <button disabled={!text.trim()} className="rounded-lg bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}

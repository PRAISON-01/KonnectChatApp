import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRoom, joinRoom } from '../features/room/roomSlice';

export default function Home() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.room);
  const [code, setCode] = useState('');
  const busy = status === 'loading';

  const join = (e) => {
    e.preventDefault();
    if (code.trim()) dispatch(joinRoom(code.trim()));
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Chat Like A Ghost.<br />End-to-End Encrypted.</h1>
      <p className="mt-4 max-w-md text-muted">Create a room, share the code, and start talking. Rooms clear themselves after a week. Messages delete themselves every 24hrs.No Footprints</p>

      <button
        onClick={() => dispatch(createRoom())}
        disabled={busy}
        className="mt-8 rounded-lg bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-ink/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:opacity-60"
      >
        Create a room
      </button>

      <form onSubmit={join} className="mt-4 flex w-full max-w-xs gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Room code"
          aria-label="Room code"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/20"
        />
        <button disabled={busy || !code.trim()} className="rounded-lg border border-line bg-white px-4 text-sm font-medium shadow-sm hover:bg-paper focus:outline-none focus:ring-2 focus:ring-ink disabled:opacity-50">
          Join
        </button>
      </form>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

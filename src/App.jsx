import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ensureSession } from './features/session/sessionSlice';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';

export default function App() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.session);
  const code = useSelector((s) => s.room.code);

  useEffect(() => { dispatch(ensureSession()); }, [dispatch]);

  let body;
  if (status == 'loading') {
    body = <div className="flex flex-1 items-center justify-center text-muted">Connecting…</div>;
  } else if (status === 'error') {
    body = (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="max-w-sm text-red-600">{error}</p>
        <button onClick={() => dispatch(ensureSession())} className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-ink/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink">
          Try again
        </button>
      </div>
    );
  } else {
    body = code ? <ChatRoom /> : <Home />;
  }

  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">{body}</main>
    </div>
  );
}

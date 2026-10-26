import { useEffect, useRef, useState } from 'react';
 
const PORTFOLIO_URL = 'https://first-landing-page-newbie.vercel.app/';
 
// Add more projects here. Each one needs a name and a url (desc is optional).
const PROJECTS = [
  { name: 'Social links profile', desc: 'Frontend Mentor challenge', url: PORTFOLIO_URL },
  // { name: 'My next project', desc: 'Short description', url: 'https://...' },
];
 
// Sliding line that grows from the left on hover (and stays while a dropdown is open).
const underline =
  'relative text-sm font-medium after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full ' +
  'after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 ' +
  'hover:after:scale-x-100 focus-visible:after:scale-x-100 aria-expanded:after:scale-x-100 ' +
  'focus:outline-none whitespace-nowrap';
 
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
 
  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
 
  return (
    <nav className="relative z-20 flex items-center justify-between border-b border-line bg-white/80 px-5 py-3 backdrop-blur">
      <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="h-4 w-4 rounded-full bg-ink" aria-hidden="true" />
        Konnect
      </span>
 
      <div className="flex items-center gap-6">
        <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className={underline}>
          About
        </a>
 
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="true"
            className={`${underline} flex items-center gap-1`}
          >
            Discover other projects
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
 
          {open && (
            <ul className="absolute right-0 mt-3 w-64 rounded-xl border border-line bg-white p-1 shadow-lg">
              {PROJECTS.map((p) => (
                <li key={p.name}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-paper focus:bg-paper focus:outline-none"
                  >
                    <span className="block text-sm font-medium">{p.name}</span>
                    {p.desc && <span className="block text-xs text-muted">{p.desc}</span>}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

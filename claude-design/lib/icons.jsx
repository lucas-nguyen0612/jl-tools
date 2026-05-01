// Minimal, consistent stroke-icon set for JL-Tools.
// All icons share: 24x24 viewBox, stroke="currentColor", strokeWidth=1.75, round caps.

const Icon = ({ children, size = 18, className = "", style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {children}
  </svg>
);

const I = {
  Play:   (p) => <Icon {...p}><path d="M7 5v14l12-7z" /></Icon>,
  Pause:  (p) => <Icon {...p}><path d="M7 5v14M17 5v14" /></Icon>,
  Reset:  (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>,
  Skip:   (p) => <Icon {...p}><path d="M5 4l10 8-10 8zM19 5v14" /></Icon>,
  Plus:   (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>,
  Check:  (p) => <Icon {...p}><path d="M4 12l5 5L20 6" /></Icon>,
  Flame:  (p) => <Icon {...p}><path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-1.5.6-2.7 1.5-3.7C10.5 6 12 3 12 3z" /></Icon>,
  Star:   (p) => <Icon {...p}><path d="M12 3l2.6 5.7L21 9.6l-4.7 4.3 1.3 6.1L12 17l-5.6 3 1.3-6.1L3 9.6l6.4-.9z" /></Icon>,
  Shield: (p) => <Icon {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></Icon>,
  Sword:  (p) => <Icon {...p}><path d="M14 4h6v6L8 22l-6-2 2-6z" /><path d="M14 10l-4 4" /></Icon>,
  Brain:  (p) => <Icon {...p}><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V4a3 3 0 0 0-3 0z" /><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0" /></Icon>,
  Timer:  (p) => <Icon {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></Icon>,
  Target: (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></Icon>,
  Cards:  (p) => <Icon {...p}><rect x="4" y="5" width="12" height="15" rx="2" /><path d="M8 2h12v15" /></Icon>,
  Calendar:(p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></Icon>,
  Chart:  (p) => <Icon {...p}><path d="M4 20V10M10 20V4M16 20v-6M22 20H2" /></Icon>,
  Settings:(p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></Icon>,
  Music:  (p) => <Icon {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></Icon>,
  Volume: (p) => <Icon {...p}><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M15 9a4 4 0 0 1 0 6" /></Icon>,
  Lock:   (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Icon>,
  Book:   (p) => <Icon {...p}><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" /></Icon>,
  Bell:   (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" /><path d="M10 21a2 2 0 0 0 4 0" /></Icon>,
  Trophy: (p) => <Icon {...p}><path d="M7 4h10v5a5 5 0 1 1-10 0z" /><path d="M5 4H2v2a3 3 0 0 0 3 3M19 4h3v2a3 3 0 0 1-3 3M10 15h4v3h2v3H8v-3h2z" /></Icon>,
  Sparkle:(p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></Icon>,
  Users:  (p) => <Icon {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15 20c0-2 2-4 4-4s3 1 3 3" /></Icon>,
  Leaf:   (p) => <Icon {...p}><path d="M4 20c0-10 8-14 16-14 0 8-4 16-14 16-1.5 0-2-.5-2-2z" /><path d="M4 20c4-4 8-8 12-10" /></Icon>,
  ArrowRight:(p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7" /></Icon>,
  Close:  (p) => <Icon {...p}><path d="M6 6l12 12M6 18L18 6" /></Icon>,
  Menu:   (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>,
  Dot:    (p) => <Icon {...p}><circle cx="12" cy="12" r="3" fill="currentColor" /></Icon>,
  Moon:   (p) => <Icon {...p}><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z" /></Icon>,
  Sun:    (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></Icon>,
};

Object.assign(window, { JLIcon: Icon, JLI: I });

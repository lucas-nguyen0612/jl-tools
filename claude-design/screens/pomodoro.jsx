// JL-Tools Pomodoro — live timer, task list, ambient sounds, session history

const JLPomodoro = () => {
  const [mode, setMode] = React.useState("focus"); // focus | short | long
  const durations = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const [remaining, setRemaining] = React.useState(durations.focus);
  const [running, setRunning] = React.useState(false);
  const [session, setSession] = React.useState(3);
  const [activeTask, setActiveTask] = React.useState(0);
  const [focusMode, setFocusMode] = React.useState(false);

  React.useEffect(() => { setRemaining(durations[mode]); }, [mode]);
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { setRunning(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = 1 - remaining / durations[mode];
  const tasks = [
    { label: "Draft Q2 roadmap doc", est: 3, done: 1 },
    { label: "Review PRs in jl-tools repo", est: 2, done: 0 },
    { label: "Study OS chapter 4", est: 4, done: 2 },
    { label: "Write meeting notes", est: 1, done: 0 },
  ];

  if (focusMode) {
    return (
      <div className="jl-root" style={{
        width: "100%", height: "100%",
        background: "radial-gradient(ellipse at top, oklch(0.22 0.02 60), oklch(0.12 0.01 60))",
        color: "white", display: "grid", placeItems: "center", position: "relative",
      }}>
        <button className="jl-btn" onClick={() => setFocusMode(false)}
          style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}>
          <JLI.Close size={14} /> Exit focus
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
            Session {session} of 4 · Focus
          </div>
          <div className="jl-display jl-tnum" style={{ fontSize: 220, lineHeight: 1, letterSpacing: "-0.05em", margin: "20px 0" }}>
            {mm}:{ss}
          </div>
          <div style={{ fontSize: 16, opacity: 0.75, marginBottom: 26 }}>{tasks[activeTask].label}</div>
          <button className="jl-btn jl-btn-accent" onClick={() => setRunning(r => !r)}
            style={{ height: 54, padding: "0 28px", fontSize: 15 }}>
            {running ? <><JLI.Pause size={16} /> Pause</> : <><JLI.Play size={16} /> Resume</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--jl-bg)" }} className="jl-root">
      <JLSideNav active="pomodoro" level={14} xp={742} xpMax={1000} />
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }} className="jl-scroll">
        <JLTopBar
          title="Pomodoro"
          subtitle="Focus block 3 of 4 · +10 XP per completed session"
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <button className="jl-btn" onClick={() => setFocusMode(true)}><JLI.Target size={14} /> Focus mode</button>
              <button className="jl-btn"><JLI.Settings size={14} /></button>
            </div>
          }
        />

        <div style={{ padding: "22px 28px 40px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>

            {/* Timer card */}
            <div className="jl-card" style={{ padding: 32, display: "grid", gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "center" }}>
              {/* Big circular timer */}
              <div style={{ position: "relative", width: 280, height: 280 }}>
                <svg width="280" height="280" viewBox="0 0 280 280">
                  <circle cx="140" cy="140" r="126" fill="none" stroke="var(--jl-bg-sunken)" strokeWidth="14" />
                  <circle cx="140" cy="140" r="126" fill="none"
                    stroke="url(#pgrad)" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 126}`}
                    strokeDashoffset={`${2 * Math.PI * 126 * (1 - pct)}`}
                    transform="rotate(-90 140 140)"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                  <defs>
                    <linearGradient id="pgrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="var(--jl-accent)" />
                      <stop offset="100%" stopColor="var(--jl-accent-strong)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--jl-text-faint)" }}>
                    {mode === "focus" ? "Focus" : mode === "short" ? "Short break" : "Long break"}
                  </div>
                  <div className="jl-display jl-tnum" style={{ fontSize: 72, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 8 }}>
                    {mm}:{ss}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--jl-text-soft)", marginTop: 4 }}>
                    Session {session}/4
                  </div>
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                {/* Mode pills */}
                <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--jl-bg-sunken)", border: "1px solid var(--jl-line-soft)", borderRadius: 999, width: "fit-content" }}>
                  {[
                    { id: "focus", label: "Focus · 25" },
                    { id: "short", label: "Short · 5" },
                    { id: "long",  label: "Long · 15" },
                  ].map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)}
                      className="jl-btn" style={{
                        height: 30, border: "none", background: mode === m.id ? "var(--jl-bg-raised)" : "transparent",
                        boxShadow: mode === m.id ? "var(--jl-shadow-sm)" : "none",
                        color: mode === m.id ? "var(--jl-text)" : "var(--jl-text-soft)",
                        fontSize: 12, fontWeight: mode === m.id ? 600 : 500,
                      }}>{m.label}</button>
                  ))}
                </div>

                {/* Active task */}
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 11, color: "var(--jl-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Working on
                  </div>
                  <div style={{ fontSize: 22, fontFamily: "var(--jl-font-display)", letterSpacing: "-0.02em" }}>
                    {tasks[activeTask].label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--jl-text-soft)", marginTop: 4 }}>
                    {tasks[activeTask].done}/{tasks[activeTask].est} pomodoros · est {tasks[activeTask].est * 25} min
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                  <button className="jl-btn jl-btn-accent" onClick={() => setRunning(r => !r)}
                    style={{ height: 46, padding: "0 22px", fontSize: 14 }}>
                    {running ? <><JLI.Pause size={15} /> Pause</> : <><JLI.Play size={15} /> Start</>}
                  </button>
                  <button className="jl-btn" onClick={() => setRemaining(durations[mode])} style={{ height: 46 }}>
                    <JLI.Reset size={14} /> Reset
                  </button>
                  <button className="jl-btn" onClick={() => { setSession(s => s + 1); setMode("short"); }} style={{ height: 46 }}>
                    <JLI.Skip size={14} /> Skip
                  </button>
                </div>

                {/* Session dots */}
                <div style={{ display: "flex", gap: 8, marginTop: 22, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--jl-text-faint)" }}>Today</span>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: i < session ? "var(--jl-accent-strong)" :
                                  i === session ? "var(--jl-accent-soft)" : "var(--jl-bg-sunken)",
                      border: `1px solid ${i === session ? "var(--jl-accent)" : "var(--jl-line-soft)"}`,
                    }} />
                  ))}
                  <span style={{ marginLeft: 10, fontSize: 11, color: "var(--jl-text-faint)" }}>+30 XP earned</span>
                </div>
              </div>
            </div>

            {/* Task list */}
            <section className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Tasks for this session</h2>
                <button className="jl-btn" style={{ marginLeft: "auto", height: 30 }}>
                  <JLI.Plus size={13} /> Add task
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {tasks.map((t, i) => (
                  <div key={i} onClick={() => setActiveTask(i)} style={{
                    display: "grid", gridTemplateColumns: "20px 1fr auto auto", gap: 14, alignItems: "center",
                    padding: "10px 10px", borderRadius: 8, cursor: "pointer",
                    background: i === activeTask ? "var(--jl-accent-soft)" : "transparent",
                    border: i === activeTask ? "1px solid color-mix(in oklch, var(--jl-accent) 35%, transparent)" : "1px solid transparent",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: "1.5px solid var(--jl-line)", background: t.done >= t.est ? "var(--jl-success)" : "transparent",
                    }} />
                    <span style={{ fontSize: 13.5, fontWeight: i === activeTask ? 600 : 500 }}>{t.label}</span>
                    <div style={{ display: "flex", gap: 3 }}>
                      {Array.from({ length: t.est }).map((_, k) => (
                        <div key={k} style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: k < t.done ? "var(--jl-accent-strong)" : "var(--jl-line)",
                        }} />
                      ))}
                    </div>
                    <span className="jl-mono" style={{ fontSize: 11, color: "var(--jl-text-faint)", minWidth: 46, textAlign: "right" }}>
                      {t.done}/{t.est}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* History + stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
              <section className="jl-card" style={{ padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Last 14 days</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                  {[4,6,3,8,7,5,9,10,6,7,11,8,10,12].map((v, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: "100%", height: `${(v / 12) * 100}%`,
                        background: i === 13 ? "var(--jl-accent-strong)" : "var(--jl-accent-soft)",
                        borderRadius: 4, minHeight: 4,
                      }} />
                      <span style={{ fontSize: 9, color: "var(--jl-text-faint)" }}>{i + 10}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 18, marginTop: 14, fontSize: 11, color: "var(--jl-text-soft)" }}>
                  <span>Avg <strong className="jl-tnum" style={{ color: "var(--jl-text)" }}>7.6</strong> / day</span>
                  <span>Best <strong className="jl-tnum" style={{ color: "var(--jl-text)" }}>12</strong></span>
                  <span>Total <strong className="jl-tnum" style={{ color: "var(--jl-text)" }}>106</strong> sessions</span>
                </div>
              </section>

              <section className="jl-card" style={{ padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>This session</h3>
                <Row label="Time focused" value="37 min" />
                <Row label="Interruptions blocked" value="4" />
                <Row label="XP earned" value="+30" accent />
                <Row label="Longest stretch" value="24:58" />
                <Row label="Est. completion" value="17:42" last />
              </section>
            </div>
          </div>

          {/* RIGHT rail */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Soundscape */}
            <div className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <JLI.Music size={15} style={{ color: "var(--jl-text-soft)", marginRight: 8 }} />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Soundscape</h3>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--jl-text-faint)" }} className="jl-mono">
                  FOREST · 42%
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { name: "Forest", icon: <JLI.Leaf size={16} />, on: true },
                  { name: "Rain", icon: <JLI.Dot size={16} /> },
                  { name: "Café", icon: <JLI.Users size={16} /> },
                  { name: "Lo-fi", icon: <JLI.Music size={16} /> },
                  { name: "Fire", icon: <JLI.Flame size={16} /> },
                  { name: "Library", icon: <JLI.Book size={16} />, locked: true },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 10,
                    background: s.on ? "var(--jl-accent-soft)" : "var(--jl-bg-sunken)",
                    border: `1px solid ${s.on ? "var(--jl-accent)" : "var(--jl-line-soft)"}`,
                    color: s.on ? "var(--jl-accent-ink)" : s.locked ? "var(--jl-text-faint)" : "var(--jl-text)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    opacity: s.locked ? 0.5 : 1,
                    cursor: s.locked ? "default" : "pointer",
                    position: "relative",
                  }}>
                    {s.icon}
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{s.name}</span>
                    {s.locked && <JLI.Lock size={10} style={{ position: "absolute", top: 6, right: 6 }} />}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                <JLI.Volume size={14} style={{ color: "var(--jl-text-soft)" }} />
                <div style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--jl-bg-sunken)", position: "relative" }}>
                  <div style={{ width: "42%", height: "100%", background: "var(--jl-accent-strong)", borderRadius: 4 }} />
                </div>
              </div>
            </div>

            {/* Distraction blocker */}
            <div className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <JLI.Shield size={15} style={{ color: "var(--jl-success)", marginRight: 8 }} />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Distraction blocker</h3>
                <span style={{
                  marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 11, color: "var(--jl-success)", fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--jl-success)" }} />
                  Active
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--jl-text-soft)", marginBottom: 12 }}>
                Blocking <strong style={{ color: "var(--jl-text)" }}>7 sites</strong> until the break begins.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { host: "twitter.com", blocked: 3 },
                  { host: "youtube.com", blocked: 1 },
                  { host: "reddit.com", blocked: 0 },
                  { host: "instagram.com", blocked: 0 },
                ].map(s => (
                  <div key={s.host} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 10px", borderRadius: 8,
                    background: "var(--jl-bg-sunken)",
                  }}>
                    <JLI.Lock size={11} style={{ color: "var(--jl-text-faint)" }} />
                    <span className="jl-mono" style={{ fontSize: 11.5, flex: 1 }}>{s.host}</span>
                    {s.blocked > 0 && (
                      <span className="jl-chip" style={{ height: 18, fontSize: 10, padding: "0 6px" }}>
                        {s.blocked} blocked
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button className="jl-btn" style={{ width: "100%", justifyContent: "center", marginTop: 12, height: 32, fontSize: 12 }}>
                Manage blocklist
              </button>
            </div>

            {/* XP ticker */}
            <div className="jl-card" style={{ padding: 20, background: "var(--jl-bg-sunken)" }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>XP this session</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <XPLine icon={<JLI.Timer size={12} />} text="Completed 25-min focus block" xp="+10" />
                <XPLine icon={<JLI.Shield size={12} />} text="No breaks during session 2" xp="+5" />
                <XPLine icon={<JLI.Target size={12} />} text="Daily quest progress" xp="+15" />
                <XPLine icon={<JLI.Flame size={12} />} text="Streak bonus (47d)" xp="+5" />
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const Row = ({ label, value, accent, last }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: last ? "none" : "1px dashed var(--jl-line-soft)",
    fontSize: 12.5,
  }}>
    <span style={{ color: "var(--jl-text-soft)" }}>{label}</span>
    <span className="jl-mono jl-tnum" style={{ fontWeight: 600, color: accent ? "var(--jl-accent-strong)" : "var(--jl-text)" }}>
      {value}
    </span>
  </div>
);

const XPLine = ({ icon, text, xp }) => (
  <li style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px dashed var(--jl-line-soft)" }}>
    <span style={{ color: "var(--jl-text-faint)" }}>{icon}</span>
    <span style={{ flex: 1, color: "var(--jl-text-soft)" }}>{text}</span>
    <span className="jl-mono" style={{ color: "var(--jl-accent-strong)", fontWeight: 600 }}>{xp}</span>
  </li>
);

window.JLPomodoro = JLPomodoro;

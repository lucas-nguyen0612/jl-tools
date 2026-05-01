// JL-Tools Mobile — condensed dashboard-style view for phones

const JLMobile = () => {
  return (
    <div className="jl-root" style={{
      width: "100%", height: "100%", background: "var(--jl-bg)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Status bar */}
      <div style={{
        height: 36, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 22px", fontSize: 12, fontWeight: 600,
      }}>
        <span className="jl-mono">9:41</span>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 14, height: 8, background: "var(--jl-text)", borderRadius: 2 }} />
          <span style={{ width: 18, height: 10, border: "1.2px solid var(--jl-text)", borderRadius: 3, position: "relative" }}>
            <span style={{ position: "absolute", inset: 1, background: "var(--jl-text)", borderRadius: 1, width: "75%" }} />
          </span>
        </span>
      </div>

      {/* Header */}
      <div style={{ padding: "6px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <JLAvatar level={14} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--jl-text-faint)" }}>Good morning,</div>
            <div className="jl-display" style={{ fontSize: 20, lineHeight: 1.1 }}>Minh · Lv 14</div>
          </div>
          <button className="jl-btn" style={{ height: 34, width: 34, padding: 0, justifyContent: "center" }}>
            <JLI.Bell size={14} />
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <JLXPBar current={742} max={1000} compact />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--jl-text-faint)", marginTop: 6 }}>
            <span>XP to Lv 15</span>
            <span className="jl-mono jl-tnum">742 / 1,000</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 16px 20px" }} className="jl-scroll">

        {/* Focus hero */}
        <div className="jl-card" style={{
          padding: 20, background: "linear-gradient(150deg, var(--jl-text), color-mix(in oklch, var(--jl-text) 80%, var(--jl-accent-strong)))",
          color: "white", borderColor: "transparent",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.7 }}>
            Session 3 of 4
          </div>
          <div className="jl-display jl-tnum" style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 6 }}>
            17:42
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Draft Q2 roadmap doc</div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="jl-btn" style={{
              flex: 1, justifyContent: "center",
              background: "white", color: "var(--jl-text)", border: "none", height: 42,
            }}>
              <JLI.Pause size={14} /> Pause
            </button>
            <button className="jl-btn" style={{
              width: 42, padding: 0, justifyContent: "center", height: 42,
              background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)",
            }}><JLI.Skip size={14} /></button>
          </div>
        </div>

        {/* Today's quests */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <JLI.Sword size={13} style={{ color: "var(--jl-accent-strong)", marginRight: 6 }} />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Daily quests</h3>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--jl-text-faint)" }}>Resets 7h</span>
          </div>
          <div className="jl-card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { title: "2 focus sessions", progress: "2/2", done: true },
              { title: "Review 50 flashcards", progress: "38/50", pct: 0.76 },
              { title: "Finish today's habits", progress: "4/6", pct: 0.66 },
            ].map((q, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 6px",
                opacity: q.done ? 0.55 : 1,
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 5,
                  background: q.done ? "var(--jl-success)" : "var(--jl-bg-sunken)",
                  border: q.done ? "none" : "1px solid var(--jl-line)",
                  display: "grid", placeItems: "center", color: "white",
                }}>{q.done && <JLI.Check size={10} />}</span>
                <span style={{ flex: 1, fontSize: 12.5, textDecoration: q.done ? "line-through" : "none" }}>{q.title}</span>
                <span style={{ fontSize: 11, color: "var(--jl-text-soft)" }} className="jl-mono">{q.progress}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Habits today */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <JLI.Flame size={13} style={{ color: "var(--jl-danger)", marginRight: 6 }} />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Today's habits</h3>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--jl-text-faint)" }}>4 of 6</span>
          </div>
          <div className="jl-card" style={{ padding: 8 }}>
            {[
              { label: "Read 30 min",         streak: 47, done: true,  color: "var(--jl-info)" },
              { label: "Deep work · 2 poms",  streak: 24, done: true,  color: "var(--jl-accent-strong)" },
              { label: "Review flashcards",   streak: 31, done: false, color: "var(--jl-info)" },
              { label: "Workout",             streak: 12, done: false, color: "var(--jl-success)" },
            ].map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 8px",
                borderBottom: i < 3 ? "1px solid var(--jl-line-soft)" : "none",
              }}>
                <span style={{ width: 3, height: 22, borderRadius: 2, background: h.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{h.label}</div>
                  <div style={{ fontSize: 10, color: "var(--jl-text-faint)", marginTop: 1 }}>
                    <JLI.Flame size={9} style={{ verticalAlign: "middle" }} /> {h.streak} days
                  </div>
                </div>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: h.done ? h.color : "var(--jl-bg-sunken)",
                  border: h.done ? "none" : "1.5px solid var(--jl-line)",
                  display: "grid", placeItems: "center", color: "white",
                }}>
                  {h.done && <JLI.Check size={12} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{
        borderTop: "1px solid var(--jl-line-soft)",
        background: "var(--jl-bg-raised)",
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        padding: "8px 8px 18px",
      }}>
        {[
          { id: "home", icon: <JLI.Target size={18} />, label: "Home", on: true },
          { id: "timer", icon: <JLI.Timer size={18} />, label: "Focus" },
          { id: "habits", icon: <JLI.Flame size={18} />, label: "Habits" },
          { id: "flash", icon: <JLI.Cards size={18} />, label: "Cards" },
          { id: "me", icon: <JLI.Shield size={18} />, label: "Me" },
        ].map(t => (
          <div key={t.id} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: 6, borderRadius: 10,
            color: t.on ? "var(--jl-accent-strong)" : "var(--jl-text-faint)",
          }}>
            {t.icon}
            <span style={{ fontSize: 10, fontWeight: t.on ? 600 : 500 }}>{t.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

window.JLMobile = JLMobile;

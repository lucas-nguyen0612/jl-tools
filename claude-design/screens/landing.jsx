// Landing page for JL-Tools

const JLLanding = () => {
  return (
    <div className="jl-root" style={{ width: "100%", height: "100%", overflow: "auto", background: "var(--jl-bg)" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", gap: 24,
        padding: "20px 48px",
        borderBottom: "1px solid var(--jl-line-soft)",
        position: "sticky", top: 0, background: "color-mix(in oklch, var(--jl-bg) 85%, transparent)",
        backdropFilter: "blur(10px)", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "var(--jl-text)", color: "var(--jl-bg)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--jl-font-display)", fontWeight: 600, fontSize: 15,
          }}>J</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>JL-Tools</span>
        </div>
        <div style={{ flex: 1, display: "flex", gap: 22, justifyContent: "center", fontSize: 13, color: "var(--jl-text-soft)" }}>
          <span>Tools</span><span>Progression</span><span>Guild</span><span>Pricing</span><span>Changelog</span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 2, padding: 3,
          background: "var(--jl-bg-sunken)", border: "1px solid var(--jl-line-soft)",
          borderRadius: 999, fontSize: 11, fontWeight: 600,
        }}>
          <span style={{
            padding: "4px 10px", borderRadius: 999,
            background: "var(--jl-bg-raised)", color: "var(--jl-text)",
            boxShadow: "var(--jl-shadow-sm)",
          }}>EN</span>
          <span style={{ padding: "4px 10px", color: "var(--jl-text-faint)" }}>VI</span>
        </div>
        <button className="jl-btn">Sign in</button>
        <button className="jl-btn jl-btn-primary">Start free</button>
      </nav>

      {/* Hero */}
      <section style={{
        display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 56,
        padding: "72px 48px 56px",
        alignItems: "center",
      }}>
        <div>
          <div className="jl-chip" style={{ marginBottom: 20 }}>
            <JLI.Sparkle size={12} />
            <span>MVP · Pomodoro · Habits · Flashcards</span>
          </div>
          <h1 className="jl-display" style={{
            fontSize: 72, lineHeight: 0.98, margin: 0,
            letterSpacing: "-0.035em", fontWeight: 400,
          }}>
            Turn discipline<br/>
            into a <em style={{ color: "var(--jl-accent-strong)", fontStyle: "italic" }}>quest</em>.
          </h1>
          <p style={{ fontSize: 17, color: "var(--jl-text-soft)", marginTop: 22, maxWidth: 480, lineHeight: 1.55 }}>
            JL-Tools bundles the apps you already use for deep work — a focus timer,
            habit tracker, and spaced-repetition flashcards — under one shared XP system.
            Every session, every streak, every card reviewed moves your character forward.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <button className="jl-btn jl-btn-accent" style={{ height: 44, padding: "0 20px", fontSize: 14 }}>
              Begin your adventure <JLI.ArrowRight size={16} />
            </button>
            <button className="jl-btn" style={{ height: 44, padding: "0 18px", fontSize: 14 }}>
              <JLI.Play size={14} /> Watch 90-sec demo
            </button>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 36, fontSize: 12, color: "var(--jl-text-faint)" }}>
            <div><strong style={{ color: "var(--jl-text)", fontSize: 16, fontFamily: "var(--jl-font-display)" }}>24k+</strong><div>adventurers</div></div>
            <div><strong style={{ color: "var(--jl-text)", fontSize: 16, fontFamily: "var(--jl-font-display)" }}>1.3M</strong><div>focus minutes</div></div>
            <div><strong style={{ color: "var(--jl-text)", fontSize: 16, fontFamily: "var(--jl-font-display)" }}>89%</strong><div>keep a 7-day streak</div></div>
          </div>
        </div>

        {/* Hero visual — a stacked "product postcard" */}
        <div style={{ position: "relative", height: 540 }}>
          {/* back card: heatmap */}
          <div className="jl-card" style={{
            position: "absolute", top: 20, right: 60, width: 380, padding: 20,
            transform: "rotate(-3deg)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <JLI.Flame size={16} style={{ color: "var(--jl-accent-strong)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Deep Work streak</span>
              <span style={{ marginLeft: "auto" }} className="jl-mono jl-tnum"
                    >47 days</span>
            </div>
            <JLHeatmap weeks={22} seed={3} />
          </div>

          {/* mid card: pomodoro */}
          <div className="jl-card" style={{
            position: "absolute", top: 200, left: 10, width: 300, padding: 22,
            transform: "rotate(2deg)",
          }}>
            <div style={{ fontSize: 11, color: "var(--jl-text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Focus · Session 3 of 4
            </div>
            <div className="jl-display jl-tnum" style={{ fontSize: 76, letterSpacing: "-0.04em", lineHeight: 1 }}>
              17:42
            </div>
            <div style={{ marginTop: 14 }}>
              <JLXPBar current={742} max={1000} compact />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="jl-btn jl-btn-accent" style={{ flex: 1, justifyContent: "center" }}>
                <JLI.Pause size={14} /> Pause
              </button>
              <button className="jl-btn"><JLI.Skip size={14} /></button>
            </div>
          </div>

          {/* front card: level up toast */}
          <div className="jl-card" style={{
            position: "absolute", bottom: 20, right: 10, width: 320, padding: 18,
            display: "flex", gap: 14, alignItems: "center",
            border: "1px solid color-mix(in oklch, var(--jl-accent) 50%, transparent)",
            background: "color-mix(in oklch, var(--jl-accent-soft) 60%, var(--jl-bg-raised))",
          }}>
            <JLAvatar level={15} size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--jl-accent-ink)", fontWeight: 600 }}>
                Level up!
              </div>
              <div className="jl-display" style={{ fontSize: 20, lineHeight: 1.1, marginTop: 2 }}>
                Lv 14 → 15
              </div>
              <div style={{ fontSize: 11.5, color: "var(--jl-text-soft)", marginTop: 4 }}>
                Unlocked: <strong>Forest Soundscape</strong>
              </div>
            </div>
          </div>

          {/* top-right: badge */}
          <div style={{
            position: "absolute", top: -8, right: 10,
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--jl-epic)", color: "white",
            display: "grid", placeItems: "center",
            transform: "rotate(12deg)",
            boxShadow: "var(--jl-shadow-lg)",
            fontFamily: "var(--jl-font-display)", fontSize: 12, fontWeight: 600,
            textAlign: "center", lineHeight: 1.1,
          }}>
            <div>
              <JLI.Trophy size={20} /><br/>
              Rare<br/>Badge
            </div>
          </div>
        </div>
      </section>

      {/* Tool strip */}
      <section style={{ padding: "24px 48px 56px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
        }}>
          {[
            { icon: <JLI.Timer size={22} />, title: "Pomodoro", desc: "RPG focus timer with tasks, ambient soundscapes and distraction blocker." },
            { icon: <JLI.Flame size={22} />, title: "Habit Tracker", desc: "Streaks, heatmap, weekly insights. One dopamine hit per check." },
            { icon: <JLI.Cards size={22} />, title: "Flashcards", desc: "SM-2 spaced repetition, cloze deletion, image occlusion — Anki-grade." },
          ].map((t, i) => (
            <div key={i} className="jl-card" style={{ padding: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "var(--jl-accent-soft)", color: "var(--jl-accent-ink)",
                display: "grid", placeItems: "center", marginBottom: 18,
              }}>{t.icon}</div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--jl-text-soft)", marginTop: 8, lineHeight: 1.55 }}>{t.desc}</p>
              <div style={{ fontSize: 11, marginTop: 14, color: "var(--jl-accent-ink)", fontWeight: 500 }}>
                Open tool <JLI.ArrowRight size={12} style={{ verticalAlign: "middle" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shared XP band */}
      <section style={{
        margin: "0 48px 72px",
        padding: "40px 40px 36px",
        borderRadius: 24,
        background: "var(--jl-bg-sunken)",
        border: "1px solid var(--jl-line-soft)",
        display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 40, alignItems: "center",
      }}>
        <div>
          <div className="jl-chip" style={{ marginBottom: 14 }}>One shared character</div>
          <h2 className="jl-display" style={{ fontSize: 40, lineHeight: 1.05, margin: 0, letterSpacing: "-0.02em", fontWeight: 400 }}>
            Every tool feeds <br/> the same XP bar.
          </h2>
          <p style={{ fontSize: 14, color: "var(--jl-text-soft)", marginTop: 14, lineHeight: 1.6 }}>
            A 25-min focus session, a habit checked off, 30 flashcards reviewed — they all
            contribute to your level. Progress compounds; motivation doesn't fragment.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            padding: 14, borderRadius: 14, background: "var(--jl-bg-raised)",
            border: "1px solid var(--jl-line-soft)", minWidth: 150, textAlign: "center",
          }}>
            <JLI.Timer size={18} style={{ color: "var(--jl-text-soft)" }} />
            <div style={{ fontSize: 11, color: "var(--jl-text-faint)", marginTop: 4 }}>+10 XP</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Pomodoro</div>
          </div>
          <JLI.Plus size={14} style={{ color: "var(--jl-text-faint)" }} />
          <div style={{
            padding: 14, borderRadius: 14, background: "var(--jl-bg-raised)",
            border: "1px solid var(--jl-line-soft)", minWidth: 150, textAlign: "center",
          }}>
            <JLI.Flame size={18} style={{ color: "var(--jl-text-soft)" }} />
            <div style={{ fontSize: 11, color: "var(--jl-text-faint)", marginTop: 4 }}>+5 XP</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Habit</div>
          </div>
          <JLI.Plus size={14} style={{ color: "var(--jl-text-faint)" }} />
          <div style={{
            padding: 14, borderRadius: 14, background: "var(--jl-bg-raised)",
            border: "1px solid var(--jl-line-soft)", minWidth: 150, textAlign: "center",
          }}>
            <JLI.Cards size={18} style={{ color: "var(--jl-text-soft)" }} />
            <div style={{ fontSize: 11, color: "var(--jl-text-faint)", marginTop: 4 }}>+2 XP / card</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Flashcard</div>
          </div>
          <div style={{ flex: 1, minWidth: 80 }}>
            <JLI.ArrowRight size={16} style={{ color: "var(--jl-text-faint)", marginLeft: 6 }} />
          </div>
          <div style={{
            padding: 14, borderRadius: 14, background: "var(--jl-accent-strong)", color: "white",
            minWidth: 130, textAlign: "center",
          }}>
            <JLI.Star size={18} />
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>shared</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Character XP</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "28px 48px 40px",
        borderTop: "1px solid var(--jl-line-soft)",
        fontSize: 12, color: "var(--jl-text-faint)",
        display: "flex", gap: 24,
      }}>
        <span>© 2026 JL-Tools</span>
        <span>Privacy</span><span>Terms</span><span>Changelog</span>
        <span style={{ marginLeft: "auto" }} className="jl-mono">v0.4.2 · mvp</span>
      </footer>
    </div>
  );
};

window.JLLanding = JLLanding;

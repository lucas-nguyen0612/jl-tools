// JL-Tools Character / Profile screen — RPG sheet with stats, badges, mobile teaser

const JLCharacter = () => {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--jl-bg)" }} className="jl-root">
      <JLSideNav active="character" level={14} xp={742} xpMax={1000} />
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }} className="jl-scroll">
        <JLTopBar
          title="Character"
          subtitle="Your progress across every tool, collected into one adventurer sheet."
          right={<button className="jl-btn"><JLI.Settings size={14} /></button>}
        />
        <div style={{ padding: "22px 28px 40px", display: "grid", gridTemplateColumns: "360px 1fr", gap: 22 }}>

          {/* Character card */}
          <div className="jl-card" style={{ padding: 28, textAlign: "center" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}>
              <JLAvatar level={14} size={150} />
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--jl-accent-ink)", fontWeight: 600 }}>
              Scholar · Adventurer
            </div>
            <div className="jl-display" style={{ fontSize: 26, marginTop: 6, letterSpacing: "-0.02em" }}>
              Minh Nguyen
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 10 }}>
              <JLLevelBadge level={14} size={30} />
              <JLRarity tier="rare">Rare class</JLRarity>
            </div>
            <div style={{ marginTop: 18 }}>
              <JLXPBar current={742} max={1000} label="XP to Lv 15" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <JLStatPill icon={<JLI.Flame size={12} />} label="Streak" value="47d" />
              <JLStatPill icon={<JLI.Trophy size={12} />} label="Badges" value="23" />
            </div>
            <div style={{
              marginTop: 22, padding: 14, borderRadius: 12,
              background: "var(--jl-bg-sunken)", textAlign: "left",
            }}>
              <div style={{ fontSize: 11, color: "var(--jl-text-faint)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Title</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>"The Unwavering"</div>
              <div style={{ fontSize: 11, color: "var(--jl-text-soft)", marginTop: 4 }}>Earned from a 30-day streak.</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Stats */}
            <section className="jl-card" style={{ padding: 22 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Stats</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { stat: "Focus", value: 62, icon: <JLI.Timer size={14} />, desc: "Hours of deep work this month" },
                  { stat: "Discipline", value: 78, icon: <JLI.Shield size={14} />, desc: "Habit consistency" },
                  { stat: "Knowledge", value: 54, icon: <JLI.Brain size={14} />, desc: "Cards mastered" },
                  { stat: "Endurance", value: 84, icon: <JLI.Flame size={14} />, desc: "Current streak strength" },
                ].map(s => (
                  <div key={s.stat} style={{ padding: 14, borderRadius: 12, background: "var(--jl-bg-sunken)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--jl-text-soft)", fontSize: 11 }}>
                      {s.icon} <span style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{s.stat}</span>
                    </div>
                    <div className="jl-display jl-tnum" style={{ fontSize: 30, marginTop: 4, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ height: 5, background: "var(--jl-bg-raised)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                      <div style={{ width: `${s.value}%`, height: "100%", background: "var(--jl-accent-strong)" }} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--jl-text-faint)", marginTop: 6 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Badges */}
            <section className="jl-card" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Badges</h2>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--jl-text-faint)" }}>23 of 64 earned</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
                {[
                  { tier: "mythic",    icon: <JLI.Sparkle size={20} />, name: "Prestige I" },
                  { tier: "legendary", icon: <JLI.Timer size={20} />,   name: "100h focus" },
                  { tier: "legendary", icon: <JLI.Flame size={20} />,   name: "50-day" },
                  { tier: "rare",      icon: <JLI.Flame size={20} />,   name: "30-day" },
                  { tier: "rare",      icon: <JLI.Target size={20} />,  name: "Sharpshoot" },
                  { tier: "rare",      icon: <JLI.Trophy size={20} />,  name: "Top 3 guild" },
                  { tier: "uncommon",  icon: <JLI.Brain size={20} />,   name: "Scholar" },
                  { tier: "uncommon",  icon: <JLI.Book size={20} />,    name: "Bookworm" },
                  { tier: "uncommon",  icon: <JLI.Cards size={20} />,   name: "1000 cards" },
                  { tier: "common",    icon: <JLI.Star size={20} />,    name: "First week" },
                  { tier: "common",    icon: <JLI.Timer size={20} />,   name: "First hour" },
                  { tier: "common",    icon: <JLI.Check size={20} />,   name: "First habit" },
                  { locked: true }, { locked: true }, { locked: true }, { locked: true },
                ].map((b, i) => (
                  <div key={i} title={b.name} style={{
                    aspectRatio: 1, borderRadius: 14,
                    display: "grid", placeItems: "center",
                    background: b.locked ? "var(--jl-bg-sunken)" : `color-mix(in oklch, var(--jl-${b.tier}) 15%, var(--jl-bg-raised))`,
                    color: b.locked ? "var(--jl-text-faint)" : `var(--jl-${b.tier})`,
                    border: `1px solid ${b.locked ? "var(--jl-line)" : `color-mix(in oklch, var(--jl-${b.tier}) 40%, transparent)`}`,
                    opacity: b.locked ? 0.55 : 1, position: "relative",
                  }}>
                    {b.locked ? <JLI.Lock size={14} /> : b.icon}
                    {!b.locked && (
                      <span style={{
                        position: "absolute", bottom: 4, fontSize: 8,
                        color: "var(--jl-text-faint)", fontWeight: 500,
                        width: "100%", textAlign: "center", padding: "0 4px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{b.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <section className="jl-card" style={{ padding: 22 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Recent activity</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { icon: <JLI.Star size={12} />, color: "var(--jl-accent-strong)", text: "Earned +30 XP from 3 focus sessions", time: "2h ago" },
                  { icon: <JLI.Flame size={12} />, color: "var(--jl-danger)", text: "Extended Read 30 min streak to 47 days", time: "5h ago" },
                  { icon: <JLI.Trophy size={12} />, color: "var(--jl-legendary)", text: "Unlocked badge — 100 focus hours", time: "yesterday" },
                  { icon: <JLI.Cards size={12} />, color: "var(--jl-success)", text: "Reviewed 42 flashcards · 94% retention", time: "yesterday" },
                  { icon: <JLI.Sparkle size={12} />, color: "var(--jl-epic)", text: "Leveled up · Lv 13 → Lv 14", time: "2d ago" },
                ].map((e, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "24px 1fr auto",
                    gap: 12, alignItems: "center",
                    padding: "10px 0", borderBottom: i < 4 ? "1px dashed var(--jl-line-soft)" : "none",
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: `color-mix(in oklch, ${e.color} 18%, var(--jl-bg-raised))`,
                      color: e.color, display: "grid", placeItems: "center",
                    }}>{e.icon}</span>
                    <span style={{ fontSize: 13 }}>{e.text}</span>
                    <span style={{ fontSize: 11, color: "var(--jl-text-faint)" }} className="jl-mono">{e.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

window.JLCharacter = JLCharacter;

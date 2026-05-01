// JL-Tools Dashboard / Hub — the "home" view after login.

const JLDashboard = () => {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--jl-bg)" }} className="jl-root">
      <JLSideNav active="dashboard" level={14} xp={742} xpMax={1000} />

      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }} className="jl-scroll">
        <JLTopBar
          title="Good morning, Minh."
          subtitle="You're 258 XP away from Level 15. Three quests remaining today."
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="jl-btn"><JLI.Search size={14} /> Search</button>
              <button className="jl-btn"><JLI.Bell size={14} /></button>
              <button className="jl-btn jl-btn-accent"><JLI.Play size={14} /> Start focus</button>
            </div>
          }
        />

        <div style={{ padding: "22px 28px 40px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 22 }}>
          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>

            {/* Hero progress card */}
            <div className="jl-card" style={{ padding: 24, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 22, alignItems: "center" }}>
              <JLAvatar level={14} size={96} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <JLLevelBadge level={14} size={28} />
                  <span className="jl-display" style={{ fontSize: 22 }}>Scholar · Adventurer</span>
                  <JLRarity tier="rare">Rare class</JLRarity>
                </div>
                <div style={{ marginTop: 14 }}>
                  <JLXPBar current={742} max={1000} label="Character XP" />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                  <JLStatPill icon={<JLI.Flame size={13} style={{ color: "var(--jl-danger)" }} />} label="Streak" value="47d" />
                  <JLStatPill icon={<JLI.Timer size={13} />} label="Focus today" value="2h 45m" />
                  <JLStatPill icon={<JLI.Check size={13} />} label="Habits" value="4/6" />
                  <JLStatPill icon={<JLI.Cards size={13} />} label="Reviews" value="38/120" />
                </div>
              </div>
              <div style={{
                alignSelf: "start", padding: 12, borderRadius: 12,
                background: "var(--jl-accent-soft)", color: "var(--jl-accent-ink)",
                minWidth: 160, textAlign: "center",
              }}>
                <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Next unlock</div>
                <div className="jl-display" style={{ fontSize: 16, margin: "6px 0" }}>Deep Forest BGM</div>
                <div style={{ fontSize: 11 }}>at Level 15</div>
              </div>
            </div>

            {/* Tools grid */}
            <section>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Your tools</h2>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--jl-text-faint)" }}>3 active · 2 coming soon</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <ToolCard
                  icon={<JLI.Timer size={20} />}
                  title="Pomodoro"
                  lvl="Lv 12"
                  status="Ready"
                  meta="2h 45m today · +110 XP"
                  cta="Start 25:00"
                  active
                />
                <ToolCard
                  icon={<JLI.Flame size={20} />}
                  title="Habit Tracker"
                  lvl="Lv 9"
                  status="4 of 6 done"
                  meta="47-day streak"
                  cta="Check-in"
                />
                <ToolCard
                  icon={<JLI.Cards size={20} />}
                  title="Flashcards"
                  lvl="Lv 7"
                  status="82 due"
                  meta="3 decks · 1,240 cards"
                  cta="Study"
                />
              </div>
            </section>

            {/* Today's quests */}
            <section className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <JLI.Sword size={16} style={{ color: "var(--jl-accent-strong)" }} />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Daily quests</h2>
                <span className="jl-chip" style={{ marginLeft: "auto" }}>Resets in 7h 12m</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <QuestRow done title="Complete 2 focus sessions" reward="+30 XP" progress="2/2" />
                <QuestRow title="Review 50 flashcards" reward="+40 XP" progress="38/50" pct={0.76} />
                <QuestRow title="Check off Read 30 min" reward="+15 XP · Bookworm badge" progress="Not started" pct={0} />
                <QuestRow title="Finish today's habit list" reward="+25 XP" progress="4/6" pct={0.66} bonus />
              </div>
            </section>

            {/* Activity */}
            <section className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>This week</h2>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--jl-text-faint)" }}>Mon · Apr 20 — Sun · Apr 26</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                <MiniStat label="Focus hours" value="14h 30m" delta="+18%" spark={[4,6,5,7,8,6,9,7,8,10,11,12]} />
                <MiniStat label="XP earned" value="1,240" delta="+12%" spark={[100,120,140,90,180,160,200,220,180,240,260,300]} />
                <MiniStat label="Habits done" value="26/42" delta="+5%" spark={[3,4,3,4,5,4,5,4,5,4,5,6]} />
                <MiniStat label="Cards reviewed" value="342" delta="-4%" neg spark={[40,55,60,48,52,50,42,38,35,40,38,34]} />
              </div>
            </section>
          </div>

          {/* RIGHT rail */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Current streak */}
            <div className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "color-mix(in oklch, var(--jl-danger) 18%, var(--jl-bg-raised))",
                  color: "var(--jl-danger)",
                  display: "grid", placeItems: "center",
                }}><JLI.Flame size={20} /></div>
                <div>
                  <div className="jl-display jl-tnum" style={{ fontSize: 30, lineHeight: 1 }}>47</div>
                  <div style={{ fontSize: 11, color: "var(--jl-text-soft)" }}>day streak · longest 52</div>
                </div>
              </div>
              <div style={{ marginTop: 14, overflow: "hidden" }}>
                <JLHeatmap weeks={18} seed={7} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--jl-text-faint)", marginTop: 8 }}>
                <span>less</span>
                <span>
                  {[0,1,2,3,4].map(v => (
                    <span key={v} style={{
                      display: "inline-block", width: 10, height: 10, marginLeft: 3, borderRadius: 2,
                      background: v === 0 ? "var(--jl-bg-sunken)" :
                                  v === 4 ? "var(--jl-accent-strong)" :
                                  `color-mix(in oklch, var(--jl-accent) ${v * 25}%, var(--jl-bg-sunken))`,
                    }}/>
                  ))}
                </span>
                <span>more</span>
              </div>
            </div>

            {/* Recent badges */}
            <div className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Recent badges</h3>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--jl-text-faint)" }}>23 earned</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { icon: <JLI.Flame size={18} />, tier: "rare", name: "30-day" },
                  { icon: <JLI.Timer size={18} />, tier: "legendary", name: "100h focus" },
                  { icon: <JLI.Brain size={18} />, tier: "uncommon", name: "Scholar" },
                  { icon: <JLI.Star size={18} />, tier: "common", name: "First week" },
                  { icon: <JLI.Target size={18} />, tier: "rare", name: "Sharpshoot" },
                  { icon: <JLI.Book size={18} />, tier: "uncommon", name: "Bookworm" },
                  { icon: <JLI.Sparkle size={18} />, tier: "mythic", name: "Prestige I" },
                  { icon: <JLI.Lock size={16} />, tier: "common", name: "?", locked: true },
                ].map((b, i) => (
                  <div key={i} title={b.name} style={{
                    aspectRatio: 1, borderRadius: 12,
                    display: "grid", placeItems: "center",
                    background: b.locked ? "var(--jl-bg-sunken)" : `color-mix(in oklch, var(--jl-${b.tier}) 15%, var(--jl-bg-raised))`,
                    color: b.locked ? "var(--jl-text-faint)" : `var(--jl-${b.tier})`,
                    border: `1px solid ${b.locked ? "var(--jl-line)" : `color-mix(in oklch, var(--jl-${b.tier}) 35%, transparent)`}`,
                    opacity: b.locked ? 0.6 : 1,
                  }}>
                    {b.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Guild leaderboard */}
            <div className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <JLI.Users size={15} style={{ color: "var(--jl-text-soft)", marginRight: 8 }} />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Guild · Night Owls</h3>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--jl-text-faint)" }}>Weekly</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { rank: 1, name: "Linh.T", xp: 3420, you: false, ava: "L" },
                  { rank: 2, name: "Kaito", xp: 2980, you: false, ava: "K" },
                  { rank: 3, name: "Minh (you)", xp: 2710, you: true, ava: "M" },
                  { rank: 4, name: "Aria", xp: 2540, you: false, ava: "A" },
                  { rank: 5, name: "Duc", xp: 2230, you: false, ava: "D" },
                ].map(u => (
                  <div key={u.rank} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 8,
                    background: u.you ? "var(--jl-accent-soft)" : "transparent",
                  }}>
                    <span className="jl-mono jl-tnum" style={{ width: 18, fontSize: 11, color: "var(--jl-text-faint)" }}>
                      {u.rank}
                    </span>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "var(--jl-bg-sunken)", border: "1px solid var(--jl-line)",
                      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600,
                    }}>{u.ava}</div>
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: u.you ? 600 : 500 }}>{u.name}</span>
                    <span className="jl-mono jl-tnum" style={{ fontSize: 12 }}>{u.xp.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

/* --- Helpers --- */
const ToolCard = ({ icon, title, lvl, status, meta, cta, active }) => (
  <div className="jl-card" style={{
    padding: 18, position: "relative", overflow: "hidden",
    border: active ? "1px solid color-mix(in oklch, var(--jl-accent) 45%, transparent)" : undefined,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: "var(--jl-accent-soft)", color: "var(--jl-accent-ink)",
        display: "grid", placeItems: "center",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--jl-text-faint)" }}>{lvl} · {status}</div>
      </div>
    </div>
    <div style={{ fontSize: 12, color: "var(--jl-text-soft)", margin: "14px 0 12px" }}>{meta}</div>
    <button className={`jl-btn ${active ? "jl-btn-accent" : ""}`} style={{ width: "100%", justifyContent: "center" }}>
      {cta} <JLI.ArrowRight size={12} />
    </button>
  </div>
);

const QuestRow = ({ title, reward, progress, pct, done, bonus }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "20px 1fr 100px 90px", gap: 14, alignItems: "center",
    padding: "10px 6px",
    opacity: done ? 0.55 : 1,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: 6,
      background: done ? "var(--jl-success)" : "var(--jl-bg-sunken)",
      border: done ? "1px solid var(--jl-success)" : "1px solid var(--jl-line)",
      display: "grid", placeItems: "center", color: "white",
    }}>{done && <JLI.Check size={11} />}</div>
    <div>
      <div style={{
        fontSize: 13, fontWeight: 500,
        textDecoration: done ? "line-through" : "none",
      }}>
        {title} {bonus && <span style={{ fontSize: 10, color: "var(--jl-epic)", marginLeft: 6, fontWeight: 600, letterSpacing: "0.05em" }}>BONUS</span>}
      </div>
      <div style={{ fontSize: 11, color: "var(--jl-text-faint)", marginTop: 3 }}>{reward}</div>
    </div>
    <div style={{ fontSize: 12, color: "var(--jl-text-soft)" }}>{progress}</div>
    {!done && pct !== undefined ? (
      <div style={{ height: 6, borderRadius: 999, background: "var(--jl-bg-sunken)", overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: "var(--jl-accent-strong)" }} />
      </div>
    ) : done ? (
      <div style={{ fontSize: 11, color: "var(--jl-success)", textAlign: "right", fontWeight: 600 }}>Claimed</div>
    ) : <div />}
  </div>
);

const MiniStat = ({ label, value, delta, neg, spark }) => (
  <div style={{ padding: 14, borderRadius: 12, background: "var(--jl-bg-sunken)", border: "1px solid var(--jl-line-soft)" }}>
    <div style={{ fontSize: 11, color: "var(--jl-text-soft)" }}>{label}</div>
    <div className="jl-display jl-tnum" style={{ fontSize: 22, marginTop: 4, lineHeight: 1 }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", marginTop: 8, gap: 8 }}>
      <span style={{
        fontSize: 11, fontWeight: 600,
        color: neg ? "var(--jl-danger)" : "var(--jl-success)",
      }}>{delta}</span>
      <div style={{ marginLeft: "auto" }}>
        <JLSparkline data={spark} width={100} height={28} />
      </div>
    </div>
  </div>
);

window.JLDashboard = JLDashboard;

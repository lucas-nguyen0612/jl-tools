// JL-Tools Habit Tracker — daily grid, heatmap, insights

const JLHabits = () => {
  const [habits, setHabits] = React.useState([
    { id: 1, name: "Read 30 minutes", cat: "learn", time: "morning", streak: 47, weekDone: [1,1,1,1,1,1,0], color: "var(--jl-info)" },
    { id: 2, name: "Deep work — 2 pomodoros", cat: "work", time: "morning", streak: 24, weekDone: [1,1,1,1,0,1,0], color: "var(--jl-accent-strong)" },
    { id: 3, name: "Workout", cat: "health", time: "evening", streak: 12, weekDone: [1,0,1,0,1,1,0], color: "var(--jl-success)" },
    { id: 4, name: "No social media before noon", cat: "health", time: "morning", streak: 8, weekDone: [1,1,1,1,1,0,0], color: "var(--jl-warn)" },
    { id: 5, name: "Review flashcards", cat: "learn", time: "afternoon", streak: 31, weekDone: [1,1,1,1,1,1,0], color: "var(--jl-info)" },
    { id: 6, name: "Journal · 3 lines", cat: "health", time: "evening", streak: 15, weekDone: [1,1,1,1,1,1,0], color: "var(--jl-success)" },
  ]);

  const toggle = (habitId, dayIdx) => {
    setHabits(hs => hs.map(h => {
      if (h.id !== habitId) return h;
      const wd = [...h.weekDone];
      wd[dayIdx] = wd[dayIdx] ? 0 : 1;
      return { ...h, weekDone: wd };
    }));
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = 5; // Saturday, today

  const doneToday = habits.filter(h => h.weekDone[todayIdx]).length;
  const total = habits.length;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--jl-bg)" }} className="jl-root">
      <JLSideNav active="habits" level={14} xp={742} xpMax={1000} />
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }} className="jl-scroll">
        <JLTopBar
          title="Habits"
          subtitle={`${doneToday} of ${total} checked today · +${doneToday * 5} XP earned`}
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <button className="jl-btn"><JLI.Calendar size={14} /> Week</button>
              <button className="jl-btn jl-btn-accent"><JLI.Plus size={14} /> New habit</button>
            </div>
          }
        />

        <div style={{ padding: "22px 28px 40px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>

            {/* Weekly grid */}
            <section className="jl-card" style={{ padding: 22, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>This week</h2>
                <div style={{ display: "flex", gap: 8, marginLeft: "auto", fontSize: 11, color: "var(--jl-text-soft)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--jl-accent-strong)" }} /> Done
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--jl-bg-sunken)", border: "1px solid var(--jl-line)" }} /> Open
                  </span>
                </div>
              </div>

              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "220px repeat(7, 1fr) 70px 60px", gap: 6, marginBottom: 8 }}>
                <div />
                {days.map((d, i) => (
                  <div key={d} style={{
                    fontSize: 11, textAlign: "center",
                    color: i === todayIdx ? "var(--jl-accent-ink)" : "var(--jl-text-faint)",
                    fontWeight: i === todayIdx ? 600 : 500,
                  }}>
                    {d}
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{20 + i}</div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "var(--jl-text-faint)", textAlign: "right" }}>Streak</div>
                <div />
              </div>

              {/* Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {habits.map(h => (
                  <div key={h.id} style={{
                    display: "grid", gridTemplateColumns: "220px repeat(7, 1fr) 70px 60px", gap: 6,
                    alignItems: "center", padding: "6px 0",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{ width: 4, height: 24, borderRadius: 2, background: h.color }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {h.name}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--jl-text-faint)", textTransform: "capitalize" }}>
                          {h.cat} · {h.time}
                        </div>
                      </div>
                    </div>
                    {h.weekDone.map((d, i) => (
                      <button key={i} onClick={() => toggle(h.id, i)}
                        style={{
                          aspectRatio: 1, maxWidth: 36, margin: "0 auto", width: "100%",
                          border: i === todayIdx && !d ? `1.5px solid ${h.color}` : `1px solid ${d ? "transparent" : "var(--jl-line-soft)"}`,
                          borderRadius: 8, cursor: "pointer",
                          background: d ? h.color : "var(--jl-bg-sunken)",
                          color: "white",
                          display: "grid", placeItems: "center",
                          padding: 0,
                        }}>
                        {d ? <JLI.Check size={13} /> : null}
                      </button>
                    ))}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        <JLI.Flame size={12} style={{ color: "var(--jl-danger)" }} />
                        <span className="jl-mono jl-tnum" style={{ fontWeight: 600 }}>{h.streak}</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button className="jl-btn" style={{ height: 26, padding: "0 8px", fontSize: 11 }}>···</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Heatmap */}
            <section className="jl-card" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Activity · last 6 months</h2>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--jl-text-soft)" }}>
                  <strong className="jl-tnum" style={{ color: "var(--jl-text)" }}>182</strong> days active · longest streak <strong className="jl-tnum" style={{ color: "var(--jl-text)" }}>52</strong>
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <JLHeatmap weeks={26} seed={2} />
              </div>
              <div style={{ display: "flex", marginTop: 12, fontSize: 10, color: "var(--jl-text-faint)", justifyContent: "space-between" }}>
                <span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
              </div>
            </section>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <section className="jl-card" style={{ padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Completion rate</h3>
                <div className="jl-display jl-tnum" style={{ fontSize: 38, lineHeight: 1 }}>78%</div>
                <div style={{ fontSize: 11, color: "var(--jl-success)", marginTop: 4, fontWeight: 600 }}>+6% from last month</div>
                <div style={{ marginTop: 14 }}>
                  <JLSparkline data={[60,64,62,68,70,72,68,74,76,78,80,78]} width={280} height={50} />
                </div>
              </section>
              <section className="jl-card" style={{ padding: 20 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>By category</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { cat: "Learning", pct: 0.84, count: "2 habits", color: "var(--jl-info)" },
                    { cat: "Work", pct: 0.72, count: "1 habit", color: "var(--jl-accent-strong)" },
                    { cat: "Health", pct: 0.68, count: "3 habits", color: "var(--jl-success)" },
                  ].map(c => (
                    <div key={c.cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                        <span style={{ fontWeight: 500 }}>{c.cat}</span>
                        <span className="jl-mono jl-tnum" style={{ color: "var(--jl-text-soft)" }}>
                          {Math.round(c.pct * 100)}% · {c.count}
                        </span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "var(--jl-bg-sunken)", overflow: "hidden" }}>
                        <div style={{ width: `${c.pct * 100}%`, height: "100%", background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT rail */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Insight */}
            <div className="jl-card" style={{ padding: 20, background: "color-mix(in oklch, var(--jl-accent-soft) 50%, var(--jl-bg-raised))", borderColor: "color-mix(in oklch, var(--jl-accent) 30%, transparent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <JLI.Sparkle size={14} style={{ color: "var(--jl-accent-strong)" }} />
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "var(--jl-accent-ink)" }}>
                  Insight
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
                Your <strong>Read 30 min</strong> habit sticks <strong>2.3× better</strong> on days
                you complete a morning focus session. Try stacking them.
              </p>
            </div>

            {/* Reminders */}
            <div className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <JLI.Bell size={14} style={{ color: "var(--jl-text-soft)", marginRight: 8 }} />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Today's reminders</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { time: "07:00", label: "Read 30 minutes", done: true },
                  { time: "09:30", label: "Deep work — 2 pomodoros", done: true },
                  { time: "13:00", label: "Review flashcards", done: false, due: true },
                  { time: "18:30", label: "Workout", done: false },
                  { time: "22:00", label: "Journal · 3 lines", done: false },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 8,
                    background: r.due ? "color-mix(in oklch, var(--jl-warn) 15%, var(--jl-bg-raised))" :
                                r.done ? "transparent" : "var(--jl-bg-sunken)",
                    border: r.due ? "1px solid color-mix(in oklch, var(--jl-warn) 40%, transparent)" : "1px solid transparent",
                    opacity: r.done ? 0.5 : 1,
                  }}>
                    <span className="jl-mono" style={{ fontSize: 11, color: "var(--jl-text-soft)", width: 36 }}>{r.time}</span>
                    <span style={{ flex: 1, fontSize: 12.5, textDecoration: r.done ? "line-through" : "none" }}>{r.label}</span>
                    {r.due && <span className="jl-chip" style={{ height: 18, fontSize: 10, background: "var(--jl-warn)", color: "white", borderColor: "var(--jl-warn)" }}>Due</span>}
                    {r.done && <JLI.Check size={12} style={{ color: "var(--jl-success)" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="jl-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Today's note</h3>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--jl-text-faint)" }} className="jl-mono">Apr 25</span>
              </div>
              <div style={{
                padding: 12, borderRadius: 10, background: "var(--jl-bg-sunken)",
                fontSize: 12.5, lineHeight: 1.55, color: "var(--jl-text-soft)",
                fontFamily: "var(--jl-font-display)", fontStyle: "italic",
                border: "1px dashed var(--jl-line)",
                minHeight: 80,
              }}>
                Slept 7h — head is clear. Morning deep work felt easy. Journal later.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

window.JLHabits = JLHabits;

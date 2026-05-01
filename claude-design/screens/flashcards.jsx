// JL-Tools Flashcards — SM-2 spaced repetition with flip card + rating

const JLFlash = () => {
  const [flipped, setFlipped] = React.useState(false);
  const [cardIdx, setCardIdx] = React.useState(0);

  const cards = [
    {
      deck: "OS · Chapter 4",
      front: "What is a context switch?",
      back: "The process of storing the state of a running process or thread so its execution can be resumed later. Allows multiple processes to share a single CPU.",
      tags: ["os", "concurrency"],
    },
    {
      deck: "OS · Chapter 4",
      front: "What is the difference between process and thread?",
      back: "A process is an isolated execution context with its own memory. A thread is a lighter unit of execution sharing memory with its process.",
      tags: ["os"],
    },
  ];
  const card = cards[cardIdx % cards.length];
  const rate = (q) => { setFlipped(false); setCardIdx(i => i + 1); };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--jl-bg)" }} className="jl-root">
      <JLSideNav active="flash" level={14} xp={742} xpMax={1000} />
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }} className="jl-scroll">
        <JLTopBar
          title="Flashcards"
          subtitle="82 cards due across 3 decks · SM-2 scheduling · +2 XP per card"
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <button className="jl-btn"><JLI.Search size={14} /> Browse</button>
              <button className="jl-btn"><JLI.Plus size={14} /> New card</button>
              <button className="jl-btn jl-btn-accent"><JLI.Play size={14} /> Study all</button>
            </div>
          }
        />

        <div style={{ padding: "22px 28px 40px", display: "grid", gridTemplateColumns: "260px 1fr 320px", gap: 22 }}>

          {/* Deck list */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 11, color: "var(--jl-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, padding: "0 4px" }}>
              Decks
            </div>
            {[
              { name: "OS · Chapter 4", due: 42, total: 210, new: 8, active: true, color: "var(--jl-accent-strong)" },
              { name: "Japanese N3 vocab", due: 28, total: 680, new: 12, color: "var(--jl-info)" },
              { name: "UX principles", due: 12, total: 94, new: 4, color: "var(--jl-success)" },
              { name: "Math · Linear algebra", due: 0, total: 156, new: 0, color: "var(--jl-epic)" },
            ].map((d, i) => (
              <div key={i} className="jl-card" style={{
                padding: 14,
                border: d.active ? "1px solid color-mix(in oklch, var(--jl-accent) 45%, transparent)" : undefined,
                background: d.active ? "var(--jl-accent-soft)" : "var(--jl-bg-raised)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {d.name}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "var(--jl-text-faint)", marginBottom: 8 }}>
                  {d.total} cards · {d.new} new
                </div>
                {d.due > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="jl-chip" style={{ height: 20, fontSize: 10, padding: "0 7px", background: d.color, color: "white", borderColor: d.color }}>
                      {d.due} due
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: "var(--jl-success)", fontWeight: 500 }}>
                    <JLI.Check size={11} style={{ verticalAlign: "middle" }} /> All caught up
                  </span>
                )}
              </div>
            ))}
            <button className="jl-btn" style={{ justifyContent: "center" }}>
              <JLI.Plus size={13} /> New deck
            </button>
          </aside>

          {/* Main card area */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "stretch", minWidth: 0 }}>

            {/* Session progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--jl-text-soft)", marginBottom: 6 }}>
                  <span>Session · OS Chapter 4</span>
                  <span className="jl-mono jl-tnum">{cardIdx + 1} / 42 · {Math.round((cardIdx/42)*100)}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "var(--jl-bg-sunken)", overflow: "hidden" }}>
                  <div style={{ width: `${((cardIdx+1)/42)*100}%`, height: "100%", background: "var(--jl-accent-strong)", transition: "width .3s" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 11, color: "var(--jl-text-soft)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--jl-danger)" }} />
                  1 again
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--jl-warn)" }} />
                  3 hard
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--jl-success)" }} />
                  {cardIdx - 4 > 0 ? cardIdx - 4 : 0} good
                </span>
              </div>
            </div>

            {/* Flashcard */}
            <div
              onClick={() => setFlipped(f => !f)}
              style={{
                perspective: 1500, height: 380, cursor: "pointer",
              }}>
              <div style={{
                position: "relative", width: "100%", height: "100%",
                transformStyle: "preserve-3d",
                transition: "transform .55s cubic-bezier(.3,.8,.4,1.2)",
                transform: flipped ? "rotateX(180deg)" : "none",
              }}>
                {/* Front */}
                <div className="jl-card" style={{
                  position: "absolute", inset: 0, padding: 40,
                  backfaceVisibility: "hidden",
                  display: "flex", flexDirection: "column",
                  background: "var(--jl-bg-raised)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--jl-accent-strong)" }} />
                    <span style={{ fontSize: 11, color: "var(--jl-text-soft)" }}>{card.deck}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--jl-text-faint)" }} className="jl-mono">
                      FRONT · click to flip
                    </span>
                  </div>
                  <div style={{ flex: 1, display: "grid", placeItems: "center", textAlign: "center", padding: "0 40px" }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jl-text-faint)", marginBottom: 14 }}>
                        Question
                      </div>
                      <div className="jl-display" style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                        {card.front}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {card.tags.map(t => (
                      <span key={t} className="jl-chip" style={{ fontSize: 10, height: 20 }}>#{t}</span>
                    ))}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--jl-text-faint)" }}>
                      Press <kbd style={kbd}>Space</kbd> to flip
                    </span>
                  </div>
                </div>
                {/* Back */}
                <div className="jl-card" style={{
                  position: "absolute", inset: 0, padding: 40,
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                  background: "var(--jl-bg-raised)",
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--jl-success)" }} />
                    <span style={{ fontSize: 11, color: "var(--jl-text-soft)" }}>{card.deck}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--jl-text-faint)" }} className="jl-mono">BACK</span>
                  </div>
                  <div style={{ flex: 1, display: "grid", placeItems: "center", textAlign: "center", padding: "0 40px" }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--jl-text-faint)", marginBottom: 14 }}>
                        Answer
                      </div>
                      <div style={{ fontSize: 20, lineHeight: 1.5, color: "var(--jl-text)", maxWidth: 560, margin: "0 auto" }}>
                        {card.back}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--jl-text-faint)" }}>
                    Rate your recall below · keyboard 1–4
                  </div>
                </div>
              </div>
            </div>

            {/* Rating buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "Again", key: "1", tier: "danger",  next: "<1 min",  xp: 0 },
                { label: "Hard",  key: "2", tier: "warn",    next: "6 min",   xp: 1 },
                { label: "Good",  key: "3", tier: "success", next: "3 days",  xp: 2 },
                { label: "Easy",  key: "4", tier: "info",    next: "8 days",  xp: 3 },
              ].map(r => (
                <button key={r.label} onClick={() => rate(r.label)}
                  disabled={!flipped}
                  style={{
                    padding: "14px 10px", borderRadius: 12,
                    border: `1px solid color-mix(in oklch, var(--jl-${r.tier}) 40%, transparent)`,
                    background: flipped ? `color-mix(in oklch, var(--jl-${r.tier}) 12%, var(--jl-bg-raised))` : "var(--jl-bg-sunken)",
                    color: flipped ? `var(--jl-${r.tier})` : "var(--jl-text-faint)",
                    cursor: flipped ? "pointer" : "not-allowed",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    fontFamily: "inherit",
                  }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: "var(--jl-text-faint)" }}>next · {r.next}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 10 }}>
                    <kbd style={kbd}>{r.key}</kbd>
                    <span>+{r.xp} XP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right rail — stats + upcoming */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="jl-card" style={{ padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Retention</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className="jl-display jl-tnum" style={{ fontSize: 30, lineHeight: 1 }}>92%</div>
                  <div style={{ fontSize: 11, color: "var(--jl-text-soft)" }}>young · 14 days</div>
                </div>
                <div>
                  <div className="jl-display jl-tnum" style={{ fontSize: 30, lineHeight: 1 }}>97%</div>
                  <div style={{ fontSize: 11, color: "var(--jl-text-soft)" }}>mature · 21+ days</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <JLSparkline data={[82,84,85,86,88,89,88,90,91,92,91,92]} width={260} height={38} />
              </div>
            </div>

            <div className="jl-card" style={{ padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Card pool</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "New", count: 24, color: "var(--jl-info)" },
                  { label: "Learning", count: 12, color: "var(--jl-warn)" },
                  { label: "Young (<21d)", count: 186, color: "var(--jl-accent-strong)" },
                  { label: "Mature (21d+)", count: 924, color: "var(--jl-success)" },
                  { label: "Suspended", count: 2, color: "var(--jl-text-faint)" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 12, flex: 1 }}>{s.label}</span>
                    <span className="jl-mono jl-tnum" style={{ fontSize: 12, fontWeight: 600 }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="jl-card" style={{ padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Forecast · next 7 days</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {[82, 56, 40, 28, 44, 60, 72].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%", height: `${(v/90)*100}%`,
                      background: i === 0 ? "var(--jl-accent-strong)" : "color-mix(in oklch, var(--jl-accent) 30%, var(--jl-bg-sunken))",
                      borderRadius: 4,
                    }} />
                    <span className="jl-mono" style={{ fontSize: 9, color: "var(--jl-text-faint)" }}>
                      {["Sa","Su","Mo","Tu","We","Th","Fr"][i]}
                    </span>
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

const kbd = {
  padding: "1px 5px", borderRadius: 4,
  border: "1px solid var(--jl-line)", background: "var(--jl-bg-raised)",
  fontFamily: "var(--jl-font-mono)", fontSize: 10, color: "var(--jl-text-soft)",
};

window.JLFlash = JLFlash;

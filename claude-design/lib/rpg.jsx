// Shared JL-Tools RPG components: Avatar, XPBar, LevelBadge, StatPill, Rarity, Sparkline, Heatmap

/* ---------- Avatar (evolves w/ level) ----------
   Abstract hooded-adventurer silhouette, NOT a branded character.
   Visual "evolution" driven by level tier: cloak color, glow, accessory. */
const JLAvatar = ({ level = 12, size = 72, variant = "adventurer" }) => {
  const tier =
    level >= 50 ? "mythic" :
    level >= 30 ? "legendary" :
    level >= 15 ? "rare" :
    level >= 5  ? "uncommon" : "common";
  const tierColor = `var(--jl-${tier})`;
  const glow = tier === "mythic" || tier === "legendary";

  return (
    <div style={{
      width: size, height: size, position: "relative",
      borderRadius: "50%",
      background: `radial-gradient(circle at 50% 35%, var(--jl-accent-soft), var(--jl-bg-sunken))`,
      border: `2px solid ${tierColor}`,
      boxShadow: glow ? `0 0 0 4px color-mix(in oklch, ${tierColor} 20%, transparent), 0 0 28px color-mix(in oklch, ${tierColor} 30%, transparent)` : "var(--jl-shadow-sm)",
      overflow: "hidden",
      display: "grid", placeItems: "center",
    }}>
      <svg viewBox="0 0 72 72" width={size} height={size}>
        {/* body / cloak */}
        <path d="M10 72 C 12 54, 22 46, 36 46 C 50 46, 60 54, 62 72 Z"
          fill={tierColor} opacity="0.85" />
        {/* hood */}
        <path d="M20 40 C 22 24, 28 18, 36 18 C 44 18, 50 24, 52 40 L 50 46 C 46 42, 40 40, 36 40 C 32 40, 26 42, 22 46 Z"
          fill="var(--jl-text)" opacity="0.88" />
        {/* face shadow */}
        <ellipse cx="36" cy="34" rx="8" ry="6" fill="var(--jl-bg-sunken)" opacity="0.9" />
        {/* eye glow (tier-tinted) */}
        <circle cx="33" cy="34" r="1.2" fill={tierColor} />
        <circle cx="39" cy="34" r="1.2" fill={tierColor} />
        {/* trim */}
        <path d="M22 46 C 28 44, 44 44, 50 46" stroke="var(--jl-bg-raised)" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
      {/* tier accessory: crown pip for legendary/mythic */}
      {(tier === "legendary" || tier === "mythic") && (
        <svg style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)" }}
             width={size * 0.36} height={size * 0.22} viewBox="0 0 36 22">
          <path d="M2 20 L6 6 L12 14 L18 2 L24 14 L30 6 L34 20 Z"
            fill={tierColor} stroke="var(--jl-bg)" strokeWidth="1.2" />
        </svg>
      )}
    </div>
  );
};

/* ---------- Level Badge ---------- */
const JLLevelBadge = ({ level = 12, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "var(--jl-accent-strong)", color: "white",
    display: "grid", placeItems: "center",
    fontFamily: "var(--jl-font-display)", fontWeight: 600,
    fontSize: size * 0.42, letterSpacing: "-0.02em",
    border: "2px solid var(--jl-bg-raised)",
    boxShadow: "var(--jl-shadow)",
  }}>{level}</div>
);

/* ---------- XP Bar ----------
   Segmented progress w/ tick marks — feels more "video-gamey" than flat bar. */
const JLXPBar = ({ current = 640, max = 1000, label = "XP", segments = 20, compact = false }) => {
  const pct = Math.max(0, Math.min(1, current / max));
  const filled = Math.round(pct * segments);
  return (
    <div style={{ width: "100%" }}>
      {!compact && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--jl-text-soft)" }}>
          <span style={{ fontWeight: 500 }}>{label}</span>
          <span className="jl-mono jl-tnum">{current.toLocaleString()} / {max.toLocaleString()}</span>
        </div>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${segments}, 1fr)`,
        gap: 2, height: compact ? 8 : 12,
        padding: 2,
        background: "var(--jl-bg-sunken)",
        border: "1px solid var(--jl-line)",
        borderRadius: 999,
      }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} style={{
            borderRadius: 2,
            background: i < filled
              ? `linear-gradient(180deg, var(--jl-accent), var(--jl-accent-strong))`
              : "transparent",
            opacity: i < filled ? 1 : 0.0,
            transition: "background .2s ease",
          }} />
        ))}
      </div>
    </div>
  );
};

/* ---------- Stat Pill ---------- */
const JLStatPill = ({ icon, label, value, accent = false }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "6px 10px", borderRadius: 999,
    background: accent ? "var(--jl-accent-soft)" : "var(--jl-bg-sunken)",
    border: `1px solid ${accent ? "var(--jl-accent)" : "var(--jl-line)"}`,
    color: accent ? "var(--jl-accent-ink)" : "var(--jl-text)",
    fontSize: 12, fontWeight: 500,
  }}>
    {icon}
    <span style={{ color: "var(--jl-text-soft)" }}>{label}</span>
    <span className="jl-mono jl-tnum" style={{ fontWeight: 600 }}>{value}</span>
  </div>
);

/* ---------- Rarity Tag ---------- */
const JLRarity = ({ tier = "rare", children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em",
    fontWeight: 600, color: `var(--jl-${tier})`,
  }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: `var(--jl-${tier})` }} />
    {children || tier}
  </span>
);

/* ---------- Sparkline (tiny chart) ---------- */
const JLSparkline = ({ data = [3,5,4,7,6,8,9,7,10,12,11,14], width = 120, height = 36, accent = true }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  const stroke = accent ? "var(--jl-accent-strong)" : "var(--jl-text-soft)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--jl-accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--jl-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${points} ${width},${height}`} fill="url(#sparkfill)" stroke="none" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ---------- Streak Heatmap (GitHub-style) ---------- */
const JLHeatmap = ({ weeks = 26, seed = 1 }) => {
  // Deterministic pseudo-random
  const rand = (i) => {
    const x = Math.sin(i * 9301 + seed * 49297) * 233280;
    return x - Math.floor(x);
  };
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const r = rand(w * 7 + d);
      // more activity in recent weeks
      const recencyBias = (w / weeks) * 0.4;
      const v = Math.min(4, Math.floor((r + recencyBias) * 5));
      cells.push({ w, d, v });
    }
  }
  const levels = [
    "var(--jl-bg-sunken)",
    "color-mix(in oklch, var(--jl-accent) 25%, var(--jl-bg-sunken))",
    "color-mix(in oklch, var(--jl-accent) 50%, var(--jl-bg-sunken))",
    "color-mix(in oklch, var(--jl-accent) 75%, var(--jl-bg-sunken))",
    "var(--jl-accent-strong)",
  ];
  const cell = 12, gap = 3;
  return (
    <svg width={weeks * (cell + gap)} height={7 * (cell + gap)}
         viewBox={`0 0 ${weeks * (cell + gap)} ${7 * (cell + gap)}`}>
      {cells.map(({ w, d, v }) => (
        <rect key={`${w}-${d}`} x={w * (cell + gap)} y={d * (cell + gap)}
              width={cell} height={cell} rx={2.5}
              fill={levels[v]} />
      ))}
    </svg>
  );
};

/* ---------- Screen Shell (window chrome for each mock) ---------- */
const JLScreen = ({ title, children, width = 1280, height = 820, chrome = true }) => (
  <div className="jl-root" style={{
    width, height, background: "var(--jl-bg)",
    borderRadius: 16, overflow: "hidden",
    border: "1px solid var(--jl-line)",
    boxShadow: "var(--jl-shadow-lg)",
    display: "flex", flexDirection: "column",
  }}>
    {chrome && (
      <div style={{
        height: 34, display: "flex", alignItems: "center", gap: 8,
        padding: "0 12px", borderBottom: "1px solid var(--jl-line-soft)",
        background: "var(--jl-bg-sunken)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--jl-text-faint)", fontFamily: "var(--jl-font-mono)" }}>
          {title}
        </div>
        <div style={{ width: 40 }} />
      </div>
    )}
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</div>
  </div>
);

/* ---------- Side nav (shared across app screens) ---------- */
const JLSideNav = ({ active = "dashboard", level = 12, xp = 640, xpMax = 1000, collapsed = false }) => {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: <JLI.Target size={18} /> },
    { id: "pomodoro", label: "Pomodoro",  icon: <JLI.Timer size={18} /> },
    { id: "habits",   label: "Habits",    icon: <JLI.Flame size={18} /> },
    { id: "flash",    label: "Flashcards", icon: <JLI.Cards size={18} /> },
    { id: "quests",   label: "Quests",    icon: <JLI.Sword size={18} /> },
    { id: "guild",    label: "Guild",     icon: <JLI.Users size={18} /> },
    { id: "character",label: "Character", icon: <JLI.Shield size={18} /> },
  ];
  const w = collapsed ? 68 : 232;
  return (
    <aside style={{
      width: w, flexShrink: 0,
      borderRight: "1px solid var(--jl-line-soft)",
      background: "var(--jl-bg-raised)",
      display: "flex", flexDirection: "column",
      padding: "18px 12px",
      gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 14px" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "var(--jl-text)", color: "var(--jl-bg)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--jl-font-display)", fontWeight: 600, fontSize: 16,
        }}>J</div>
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>JL-Tools</span>
            <span style={{ fontSize: 10.5, color: "var(--jl-text-faint)", marginTop: 2 }}>focus · level up</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(it => {
          const on = it.id === active;
          return (
            <div key={it.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "10px" : "9px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 10,
              background: on ? "var(--jl-accent-soft)" : "transparent",
              color: on ? "var(--jl-accent-ink)" : "var(--jl-text-soft)",
              fontSize: 13, fontWeight: on ? 600 : 500,
              cursor: "pointer",
              border: on ? "1px solid color-mix(in oklch, var(--jl-accent) 35%, transparent)" : "1px solid transparent",
            }}>
              {it.icon}
              {!collapsed && <span>{it.label}</span>}
              {!collapsed && on && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "var(--jl-accent-strong)" }} />}
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {!collapsed && (
        <div style={{
          padding: 12, borderRadius: 12,
          background: "var(--jl-bg-sunken)",
          border: "1px solid var(--jl-line-soft)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <JLAvatar level={level} size={40} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.1 }}>Adventurer</div>
              <div style={{ fontSize: 10.5, color: "var(--jl-text-faint)" }}>Lv {level} · Scholar</div>
            </div>
          </div>
          <JLXPBar current={xp} max={xpMax} compact />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--jl-text-faint)" }}>
            <span className="jl-mono">XP</span>
            <span className="jl-mono jl-tnum">{xp}/{xpMax}</span>
          </div>
        </div>
      )}
    </aside>
  );
};

/* ---------- Top Bar ---------- */
const JLTopBar = ({ title, subtitle, right }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 16,
    padding: "18px 28px",
    borderBottom: "1px solid var(--jl-line-soft)",
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h1 className="jl-display" style={{ margin: 0, fontSize: 26, lineHeight: 1.1 }}>{title}</h1>
      {subtitle && <div style={{ fontSize: 13, color: "var(--jl-text-soft)", marginTop: 4 }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

Object.assign(window, {
  JLAvatar, JLLevelBadge, JLXPBar, JLStatPill, JLRarity,
  JLSparkline, JLHeatmap, JLScreen, JLSideNav, JLTopBar,
});

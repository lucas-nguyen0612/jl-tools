import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Dark Neon Theme — Design Tokens", () => {
  const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.ts");
  const globalsCssPath = path.join(process.cwd(), "app/globals.css");
  const layoutPath = path.join(process.cwd(), "app/layout.tsx");
  const nextConfigPath = path.join(process.cwd(), "next.config.ts");

  describe("Task 1: tailwind.config.ts — JL-Tools design tokens", () => {
    it("should define bg-primary (#0a0a0f)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#0a0a0f");
      expect(content).toContain("bg-primary");
    });

    it("should define bg-secondary (#12121a)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#12121a");
      expect(content).toContain("bg-secondary");
    });

    it("should define bg-tertiary (#1a1a2e)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#1a1a2e");
      expect(content).toContain("bg-tertiary");
    });

    it("should define neon-green (#00ff88)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#00ff88");
      expect(content).toMatch(/neon[_-]?green|"neon-green"|'neon-green'/i);
    });

    it("should define neon-pink (#ff0080)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#ff0080");
      expect(content).toMatch(/neon[_-]?pink|"neon-pink"|'neon-pink'/i);
    });

    it("should define neon-blue (#00d4ff)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#00d4ff");
      expect(content).toMatch(/neon[_-]?blue|"neon-blue"|'neon-blue'/i);
    });

    it("should define neon-purple (#8b5cf6)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#8b5cf6");
      expect(content).toMatch(/neon[_-]?purple|"neon-purple"|'neon-purple'/i);
    });

    it("should define streak colors (cold, warm, hot, pink)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#606070"); // streak-cold
      expect(content).toContain("#ffdd00"); // streak-warm
      expect(content).toContain("#ff6b00"); // streak-hot
      expect(content).toContain("#ff0080"); // streak-pink
    });

    it("should define bg-elevated (#22223a)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#22223a");
      expect(content).toContain("bg-elevated");
    });

    it("should define neon-yellow (#ffdd00) and neon-orange (#ff6b00)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).toContain("#ffdd00");
      expect(content).toContain("#ff6b00");
      expect(content).toMatch(/neon[_-]?yellow|"neon-yellow"|'neon-yellow'/i);
      expect(content).toMatch(/neon[_-]?orange|"neon-orange"|'neon-orange'/i);
    });

    it("should NOT use 'class' darkMode (dark is default, not toggled)", () => {
      const content = fs.readFileSync(tailwindConfigPath, "utf-8");
      expect(content).not.toContain('darkMode: ["class"]');
      // Dark mode should be disabled or use different strategy
    });
  });

  describe("Task 2: app/globals.css — Dark theme defaults", () => {
    it("should define --bg-primary CSS variable as #0a0a0f", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("--bg-primary");
      expect(content).toContain("#0a0a0f"); // must be 0f, not 0d
    });

    it("should define --neon-green CSS variable as #00ff88", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("--neon-green");
      expect(content).toContain("#00ff88");
    });

    it("should NOT have a .dark {} wrapper (dark is default)", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      // Should not have .dark { ... } pattern wrapping dark values
      expect(content).not.toMatch(/\.dark\s*\{[^}]*--background/);
    });

    it("should define streak color classes", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("streak-cold");
      expect(content).toContain("streak-warm");
      expect(content).toContain("streak-hot");
      expect(content).toContain("streak-pink");
    });

    it("should define glassmorphism utility class", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("glassmorphism");
    });

    it("should define --bg-elevated CSS variable as #22223a", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("--bg-elevated");
      expect(content).toContain("#22223a");
    });

    it("should define --neon-yellow (#ffdd00) and --neon-orange (#ff6b00)", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("--neon-yellow");
      expect(content).toContain("#ffdd00");
      expect(content).toContain("--neon-orange");
      expect(content).toContain("#ff6b00");
    });

    it("should define --text-primary (#ffffff), --text-secondary, --text-muted", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("--text-primary");
      expect(content).toContain("#ffffff");
      expect(content).toContain("--text-secondary");
      expect(content).toContain("#a0a0b0");
      expect(content).toContain("--text-muted");
      expect(content).toContain("#606070");
    });

    it("should define text-neon-yellow and text-neon-orange utilities", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain("text-neon-yellow");
      expect(content).toContain("text-neon-orange");
    });

    it("should define bg-bg-primary/secondary/tertiary/elevated utilities", () => {
      const content = fs.readFileSync(globalsCssPath, "utf-8");
      expect(content).toContain(".bg-bg-primary");
      expect(content).toContain(".bg-bg-secondary");
      expect(content).toContain(".bg-bg-tertiary");
      expect(content).toContain(".bg-bg-elevated");
    });
  });

  describe("Task 3: app/layout.tsx — Correct fonts", () => {
    it("should use Inter font (not Geist)", () => {
      const content = fs.readFileSync(layoutPath, "utf-8");
      expect(content).toMatch(/Inter|next\/font\/google.*Inter/i);
      expect(content).not.toMatch(/Geist/);
    });

    it("should include JetBrains Mono font", () => {
      const content = fs.readFileSync(layoutPath, "utf-8");
      expect(content).toMatch(/JetBrains.*Mono|JetBrains_Mono/i);
    });

    it("should NOT apply 'dark' class to html (dark is already default)", () => {
      const content = fs.readFileSync(layoutPath, "utf-8");
      // Should not have class="dark" on html element
      expect(content).not.toMatch(/<html[^>]*class=["'][^"']*\bdark\b/);
    });
  });

  describe("Task 4: next.config.ts — Font optimization", () => {
    it("should reference Inter font", () => {
      const content = fs.readFileSync(nextConfigPath, "utf-8");
      expect(content).toMatch(/Inter|next\/font/i);
    });
    it("should NOT contain invalid config key 'cacheComponents'", () => {
      const content = fs.readFileSync(nextConfigPath, "utf-8");
      expect(content).not.toMatch(/cacheComponents/);
    });
  });
});

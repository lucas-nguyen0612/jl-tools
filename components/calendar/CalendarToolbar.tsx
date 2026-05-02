'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CALENDAR_SOURCES,
  SOURCE_KEYS,
  SOURCE_FILTER_LABEL_KEYS,
  type SourceKey,
} from '@/features/calendar/sources';

export type CalendarView = 'day' | 'week' | 'month';

export type CalendarToolbarProps = {
  /** Pre-formatted title like "May 2026" or "May 2 – 8". Caller computes via Intl.DateTimeFormat. */
  title: string;
  view: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeView: (v: CalendarView) => void;
  visibleSources: Set<SourceKey>;
  onToggleSource: (key: SourceKey) => void;
  /** Per-source counts shown in the source-filter chips' tooltips (optional). */
  sourceCounts?: Partial<Record<SourceKey, number>>;
};

const navBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 'var(--jl-r-sm)',
  border: '1px solid var(--jl-line)',
  background: 'var(--jl-bg-raised)',
  color: 'var(--jl-text)',
  cursor: 'pointer',
};

const todayBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 32,
  padding: '0 12px',
  borderRadius: 'var(--jl-r-sm)',
  border: '1px solid var(--jl-line)',
  background: 'var(--jl-bg-raised)',
  color: 'var(--jl-text)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--jl-font-display)',
  fontSize: 24,
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: 'var(--jl-text)',
  margin: 0,
  flex: 1,
};

const helpBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 'var(--jl-r-sm)',
  border: '1px solid var(--jl-line)',
  background: 'var(--jl-bg-raised)',
  color: 'var(--jl-text-soft)',
  cursor: 'pointer',
};

const kbdStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 22,
  height: 22,
  padding: '0 6px',
  borderRadius: 4,
  border: '1px solid var(--jl-line)',
  background: 'var(--jl-bg-sunken)',
  color: 'var(--jl-text)',
  fontSize: 11,
  fontWeight: 600,
  fontFamily: 'var(--jl-font-mono, ui-monospace, SFMono-Regular, monospace)',
};

const shortcutRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 13,
  color: 'var(--jl-text)',
};

type SourceChipProps = {
  sourceKey: SourceKey;
  active: boolean;
  label: string;
  color: string;
  count?: number;
  onClick: () => void;
};

function SourceChip({ sourceKey, active, label, color, count, onClick }: SourceChipProps): ReactElement {
  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 26,
    padding: '0 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    border: active
      ? `1px solid color-mix(in oklch, ${color} 50%, transparent)`
      : '1px solid var(--jl-line)',
    background: active
      ? `color-mix(in oklch, ${color} 14%, transparent)`
      : 'transparent',
    color: active ? 'var(--jl-text)' : 'var(--jl-text-faint)',
    opacity: active ? 1 : 0.6,
  };

  return (
    <button
      type="button"
      data-source={sourceKey}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      style={chipStyle}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
      {typeof count === 'number' && (
        <span style={{ color: 'var(--jl-text-soft)' }}>{` · ${count}`}</span>
      )}
    </button>
  );
}

export function CalendarToolbar(props: CalendarToolbarProps): ReactElement {
  const {
    title,
    view,
    onPrev,
    onNext,
    onToday,
    onChangeView,
    visibleSources,
    onToggleSource,
    sourceCounts,
  } = props;
  const t = useTranslations('calendar');

  return (
    <div
      className="flex flex-col md:flex-row md:items-center"
      style={{
        gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid var(--jl-line-soft)',
      }}
    >
      {/* Row 1 (mobile + desktop start): nav + today + title + help */}
      <div
        className="flex items-center"
        style={{ gap: 12, flex: 1, minWidth: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={onPrev}
            aria-label={t('views.prev')}
            style={navBtnStyle}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={t('views.next')}
            style={navBtnStyle}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button type="button" onClick={onToday} style={todayBtnStyle}>
          {t('views.today')}
        </button>

        <h2 style={titleStyle}>{title}</h2>

        {/* Help button — visible on mobile within row 1, hidden on md (shown in row-end group on desktop) */}
        <div className="md:hidden">
          <ShortcutsPopover />
        </div>
      </div>

      {/* Row 2 (mobile) / inline (desktop): source chips + view tabs + help */}
      <div
        className="flex flex-wrap items-center"
        style={{ gap: 12 }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SOURCE_KEYS.map((key) => {
            const meta = CALENDAR_SOURCES[key];
            const label = t(SOURCE_FILTER_LABEL_KEYS[key]);
            return (
              <SourceChip
                key={key}
                sourceKey={key}
                active={visibleSources.has(key)}
                label={label}
                color={meta.color}
                count={sourceCounts?.[key]}
                onClick={() => onToggleSource(key)}
              />
            );
          })}
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => onChangeView(v as CalendarView)}
        >
          <TabsList>
            <TabsTrigger value="day">{t('views.day')}</TabsTrigger>
            <TabsTrigger value="week">{t('views.week')}</TabsTrigger>
            <TabsTrigger value="month">{t('views.month')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Help button — desktop only here (mobile shows it in row 1) */}
        <div className="hidden md:block">
          <ShortcutsPopover />
        </div>
      </div>
    </div>
  );
}

function ShortcutsPopover(): ReactElement {
  const t = useTranslations('calendar');
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('shortcuts.title')}
          title={t('shortcuts.title')}
          style={helpBtnStyle}
        >
          <Keyboard size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--jl-text-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {t('shortcuts.title')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={shortcutRowStyle}>
              <span style={kbdStyle}>T</span>
              <span>{t('shortcuts.today')}</span>
            </div>
            <div style={shortcutRowStyle}>
              <span style={kbdStyle}>1</span>
              <span style={kbdStyle}>2</span>
              <span style={kbdStyle}>3</span>
              <span>{t('shortcuts.views')}</span>
            </div>
            <div style={shortcutRowStyle}>
              <span style={kbdStyle}>{'←'}</span>
              <span style={kbdStyle}>{'→'}</span>
              <span>{t('shortcuts.nav')}</span>
            </div>
            <div style={shortcutRowStyle}>
              <span style={kbdStyle}>N</span>
              <span>{t('shortcuts.new')}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

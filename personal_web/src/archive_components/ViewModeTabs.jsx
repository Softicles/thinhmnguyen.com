import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

const TABS = ['Album', 'Days', 'Months', 'Years'];

export default function ViewModeTabs({ activeTab, onTabChange }) {
  const tabRefs = useRef([]);
  const indicatorRef = useRef(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const moveIndicator = (idx) => {
    const el = tabRefs.current[idx];
    const indicator = indicatorRef.current;
    if (!el || !indicator) return;

    const containerLeft = el.parentElement?.getBoundingClientRect().left ?? 0;
    const tabRect = el.getBoundingClientRect();
    const targetLeft = tabRect.left - containerLeft;
    const targetWidth = tabRect.width;

    if (reducedMotion) {
      indicator.style.left = `${targetLeft}px`;
      indicator.style.width = `${targetWidth}px`;
      return;
    }

    animate(indicator, {
      left: targetLeft,
      width: targetWidth,
      duration: 260,
      easing: 'easeOutQuad',
    });
  };

  // Position indicator on mount and on active tab change
  useEffect(() => {
    const idx = TABS.findIndex(t => t.toLowerCase() === activeTab);
    if (idx >= 0) moveIndicator(idx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div
      style={{
        display: 'inline-flex',
        position: 'relative',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        padding: '4px',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.15)',
        marginBottom: '24px',
      }}
    >
      {TABS.map((tab, idx) => {
        const value = tab.toLowerCase();
        const isActive = activeTab === value;
        return (
          <button
            key={tab}
            ref={el => { tabRefs.current[idx] = el; }}
            onClick={() => onTabChange(value)}
            aria-pressed={isActive}
            style={{
              position: 'relative',
              padding: '7px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'none',
              color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.65)',
              fontWeight: isActive ? '600' : '400',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'color 0.2s',
              zIndex: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        );
      })}
      {/* Sliding indicator */}
      <div
        ref={indicatorRef}
        className="view-tab-indicator"
        style={{ left: 0, width: 0 }}
      />
    </div>
  );
}

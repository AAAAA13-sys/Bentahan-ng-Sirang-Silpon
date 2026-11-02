import React from 'react';
import { useCurrentFrame, interpolate, Easing, Img, staticFile } from 'remotion';
import { THEME } from '../types';

interface FormalBrowserFrameProps {
  imageSrc: string;
  url: string;
  chapterNum: string;
  chapterTitle: string;
  keyHighlights: string[];
  panYStart?: number;
  panYEnd?: number;
  zoomStart?: number;
  zoomEnd?: number;
}

export const FormalBrowserFrame: React.FC<FormalBrowserFrameProps> = ({
  imageSrc,
  url,
  chapterNum,
  chapterTitle,
  keyHighlights,
  panYStart = 0,
  panYEnd = -100,
  zoomStart = 1,
  zoomEnd = 1.05,
}) => {
  const frame = useCurrentFrame();

  const panY = interpolate(frame, [0, 780], [panYStart, panYEnd], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const zoom = interpolate(frame, [0, 780], [zoomStart, zoomEnd], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const lowerThirdSlide = interpolate(frame, [0, 30], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const lowerThirdOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'relative',
        width: 1920,
        height: 1080,
        backgroundColor: '#070b12',
        backgroundImage: `
          radial-gradient(circle at 50% 10%, rgba(0, 240, 255, 0.08) 0%, transparent 50%),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Top Academic Presentation Header */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 50,
          right: 50,
          height: 48,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 10,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              color: '#00f0ff',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: '0.1em',
            }}
          >
            CAPSTONE DEMONSTRATION
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
            SILICON TRADING <span style={{ color: THEME.textMuted, fontWeight: 400 }}>// Circular Electronics Reclaiming Platform</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: THEME.textMuted }}>
          <span>Stack: PERN (PostgreSQL / Express / React 19 / Node)</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: THEME.success }} />
          <span style={{ color: THEME.success, fontWeight: 600 }}>Active Web Service (Local Cluster)</span>
        </div>
      </div>

      {/* Main Browser Window Mockup Container */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 50,
          right: 50,
          bottom: 110,
          backgroundColor: '#0c1322',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.08)',
          zIndex: 20,
        }}
      >
        {/* Browser Top Window Bar */}
        <div
          style={{
            height: 44,
            backgroundColor: '#0f172a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 16,
            flexShrink: 0,
          }}
        >
          {/* Window Action Dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>

          {/* Browser Omnibar / URL */}
          <div
            style={{
              flex: 1,
              maxWidth: 700,
              margin: '0 auto',
              height: 28,
              backgroundColor: '#020617',
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: 8,
              fontSize: 12,
              color: THEME.textMuted,
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: THEME.success }}>🔒</span>
            <span style={{ color: '#ffffff' }}>{url}</span>
          </div>

          {/* Window Status Pill */}
          <div style={{ fontSize: 11, color: THEME.textDim, fontFamily: 'monospace' }}>
            VIEWPORT: 1920x1080 (LIVE HYDRATED UI)
          </div>
        </div>

        {/* Browser Webpage Content Viewport */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#060a12',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: `translateY(${panY}px) scale(${zoom})`,
              transformOrigin: 'top center',
            }}
          >
            <Img
              src={staticFile(imageSrc)}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>

      {/* Formal Lower-Third Academic Banner */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: 50,
          right: 50,
          height: 74,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          zIndex: 50,
          transform: `translateY(${lowerThirdSlide}px)`,
          opacity: lowerThirdOpacity,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
              color: '#020617',
              fontWeight: 900,
              fontSize: 13,
              padding: '6px 14px',
              borderRadius: 6,
              letterSpacing: '0.05em',
            }}
          >
            {chapterNum}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              {chapterTitle}
            </div>
            <div style={{ fontSize: 12, color: THEME.accent, fontWeight: 600 }}>
              Official System Walkthrough // Technopreneurship Capstone Project
            </div>
          </div>
        </div>

        {/* Key Feature Bullets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {keyHighlights.map((hl, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: THEME.primary, fontSize: 13 }}>✔</span>
              <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{hl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

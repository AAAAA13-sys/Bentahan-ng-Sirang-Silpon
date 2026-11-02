import React from 'react';
import { useCurrentFrame } from 'remotion';
import { THEME } from '../types';

export const CyberBackground: React.FC<{ chapterTitle?: string; chapterNum?: string }> = ({
  chapterTitle,
  chapterNum,
}) => {
  const frame = useCurrentFrame();

  const gridOffset = (frame * 1.5) % 80;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: THEME.bg,
        backgroundImage: `
          radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 80px 80px, 80px 80px',
        backgroundPosition: `0 0, 0 0, 0 ${gridOffset}px, 0 ${gridOffset}px`,
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
      }}
    >
      {/* Corner HUD Reticles */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 20, height: 20, borderTop: `2px solid ${THEME.primary}`, borderLeft: `2px solid ${THEME.primary}` }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 20, height: 20, borderTop: `2px solid ${THEME.primary}`, borderRight: `2px solid ${THEME.primary}` }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 20, height: 20, borderBottom: `2px solid ${THEME.primary}`, borderLeft: `2px solid ${THEME.primary}` }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 20, height: 20, borderBottom: `2px solid ${THEME.primary}`, borderRight: `2px solid ${THEME.primary}` }} />

      {/* Top Status Strip */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 70,
          right: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 15,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: '#040d1a' }}>ST</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>
              SILICON TRADING <span style={{ color: THEME.accent, fontWeight: 400 }}>// BENTAHAN NG SIRANG SILPON</span>
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Philippine Circular Electronics Marketplace • PGlite / PERN Cluster
            </div>
          </div>
        </div>

        {chapterTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {chapterNum && (
              <span
                style={{
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 4,
                  letterSpacing: '0.05em',
                }}
              >
                {chapterNum}
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text, letterSpacing: '0.02em' }}>
              {chapterTitle}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: THEME.success,
                boxShadow: `0 0 10px ${THEME.success}`,
              }}
            />
            <span style={{ fontSize: 12, color: THEME.textMuted, fontFamily: 'monospace' }}>
              CLUSTER: ONLINE (127.0.0.1:8090)
            </span>
          </div>
        </div>
      </div>

      {/* Cyber Circuit ambient overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 25,
          left: 70,
          right: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: THEME.textDim,
          fontFamily: 'monospace',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: 10,
          zIndex: 50,
        }}
      >
        <span>SYS: BENTAHAN-CIRCUIT-RECLAIM // MANILA • QUIAPO • RAON • GREENHILLS</span>
        <span>ESCROW GUARANTEE: 8% • 24H FULL REFUND PROTOCOL • BIT-LEVEL INTEGRITY</span>
      </div>
    </div>
  );
};

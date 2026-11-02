import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Img, staticFile } from 'remotion';

interface PureWebpageFrameProps {
  imageSrc: string;
  panYStart?: number;
  panYEnd?: number;
  zoomStart?: number;
  zoomEnd?: number;
}

export const PureWebpageFrame: React.FC<PureWebpageFrameProps> = ({
  imageSrc,
  panYStart = 0,
  panYEnd = -80,
  zoomStart = 1.0,
  zoomEnd = 1.02,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const panY = interpolate(frame, [0, durationInFrames], [panYStart, panYEnd], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const zoom = interpolate(frame, [0, durationInFrames], [zoomStart, zoomEnd], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'relative',
        width: 1920,
        height: 1080,
        backgroundColor: '#090d16',
        overflow: 'hidden',
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
  );
};

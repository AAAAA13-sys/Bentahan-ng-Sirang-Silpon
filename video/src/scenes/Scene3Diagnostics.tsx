import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene3Diagnostics: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/05_part_detail.png"
        panYStart={0}
        panYEnd={-250}
        zoomStart={1.0}
        zoomEnd={1.03}
      />
      <Audio src={staticFile('audio/3.wav')} />
    </>
  );
};

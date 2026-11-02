import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene8ArchitectureOutro: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/12_how_it_works.png"
        panYStart={0}
        panYEnd={-220}
        zoomStart={1.0}
        zoomEnd={1.03}
      />
      <Audio src={staticFile('audio/8.wav')} />
    </>
  );
};

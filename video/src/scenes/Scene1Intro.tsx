import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene1Intro: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/01_home_hero.png"
        panYStart={0}
        panYEnd={-120}
        zoomStart={1.0}
        zoomEnd={1.03}
      />
      <Audio src={staticFile('audio/1.wav')} />
    </>
  );
};

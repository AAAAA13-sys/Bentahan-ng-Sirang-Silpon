import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene2Catalog: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/03_marketplace_catalog.png"
        panYStart={0}
        panYEnd={-260}
        zoomStart={1.0}
        zoomEnd={1.04}
      />
      <Audio src={staticFile('audio/2.wav')} />
    </>
  );
};

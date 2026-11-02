import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene7DisputeBulk: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/11_bulk_scrap.png"
        panYStart={0}
        panYEnd={-250}
        zoomStart={1.0}
        zoomEnd={1.04}
      />
      <Audio src={staticFile('audio/7.wav')} />
    </>
  );
};

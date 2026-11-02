import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene6BuyerOrder: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/10_order_details.png"
        panYStart={0}
        panYEnd={-160}
        zoomStart={1.0}
        zoomEnd={1.02}
      />
      <Audio src={staticFile('audio/6.wav')} />
    </>
  );
};

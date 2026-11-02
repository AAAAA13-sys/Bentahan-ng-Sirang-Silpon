import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene5SellListing: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/07_sell_page.png"
        panYStart={0}
        panYEnd={-260}
        zoomStart={1.0}
        zoomEnd={1.03}
      />
      <Audio src={staticFile('audio/5.wav')} />
    </>
  );
};

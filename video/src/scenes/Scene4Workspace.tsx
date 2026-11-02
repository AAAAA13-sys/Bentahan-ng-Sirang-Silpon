import React from 'react';
import { Audio, staticFile } from 'remotion';
import { PureWebpageFrame } from '../components/PureWebpageFrame';

export const Scene4Workspace: React.FC = () => {
  return (
    <>
      <PureWebpageFrame
        imageSrc="real-ui/08_workspace.png"
        panYStart={0}
        panYEnd={-150}
        zoomStart={1.0}
        zoomEnd={1.02}
      />
      <Audio src={staticFile('audio/4.wav')} />
    </>
  );
};

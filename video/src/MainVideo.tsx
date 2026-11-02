import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Catalog } from './scenes/Scene2Catalog';
import { Scene3Diagnostics } from './scenes/Scene3Diagnostics';
import { Scene4Workspace } from './scenes/Scene4Workspace';
import { Scene5SellListing } from './scenes/Scene5SellListing';
import { Scene6BuyerOrder } from './scenes/Scene6BuyerOrder';
import { Scene7DisputeBulk } from './scenes/Scene7DisputeBulk';
import { Scene8ArchitectureOutro } from './scenes/Scene8ArchitectureOutro';

export const SCENE_DURATIONS = {
  scene1: 405, // 13.5s (Audio: 12.47s)
  scene2: 435, // 14.5s (Audio: 13.41s)
  scene3: 375, // 12.5s (Audio: 11.35s)
  scene4: 420, // 14.0s (Audio: 12.76s)
  scene5: 375, // 12.5s (Audio: 11.28s)
  scene6: 435, // 14.5s (Audio: 13.33s)
  scene7: 225, // 7.5s  (Audio: 6.04s)
  scene8: 495, // 16.5s (Audio: 15.12s)
};
export const TRANSITION_DURATION = 20;

export const MainVideo: React.FC = () => {
  return (
    <TransitionSeries>
      {/* Scene 1: Intro */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene1} name="Scene1-Intro">
        <Scene1Intro />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 2: Marketplace Catalog */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene2} name="Scene2-Catalog">
        <Scene2Catalog />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 3: Micro-Diagnostics & 8% Escrow */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene3} name="Scene3-Diagnostics">
        <Scene3Diagnostics />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 4: Seller Workspace & Stock Controls */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene4} name="Scene4-Workspace">
        <Scene4Workspace />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 5: Listing Creation (/sell) */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene5} name="Scene5-SellListing">
        <Scene5SellListing />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 6: Buyer Order & 24H Full Refund Window */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene6} name="Scene6-BuyerOrder">
        <Scene6BuyerOrder />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 7: Technical Dispute & Bulk Scrap */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene7} name="Scene7-DisputeBulk">
        <Scene7DisputeBulk />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 8: Architecture Sovereignty & Outro */}
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene8} name="Scene8-ArchitectureOutro">
        <Scene8ArchitectureOutro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

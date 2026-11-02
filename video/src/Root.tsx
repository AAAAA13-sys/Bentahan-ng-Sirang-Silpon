import React from 'react';
import { Composition, Folder } from 'remotion';
import { MainVideo, SCENE_DURATIONS, TRANSITION_DURATION } from './MainVideo';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Catalog } from './scenes/Scene2Catalog';
import { Scene3Diagnostics } from './scenes/Scene3Diagnostics';
import { Scene4Workspace } from './scenes/Scene4Workspace';
import { Scene5SellListing } from './scenes/Scene5SellListing';
import { Scene6BuyerOrder } from './scenes/Scene6BuyerOrder';
import { Scene7DisputeBulk } from './scenes/Scene7DisputeBulk';
import { Scene8ArchitectureOutro } from './scenes/Scene8ArchitectureOutro';

export const TOTAL_DURATION =
  Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0) -
  7 * TRANSITION_DURATION; // 3,025 frames (~1m 40s)

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Master Promotional Walkthrough */}
      <Composition
        id="SiliconTradingWalkthrough"
        component={MainVideo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Individual Scenes with Exact Audio-Matched Timing */}
      <Folder name="Walkthrough-Scenes">
        <Composition
          id="01-Intro"
          component={Scene1Intro}
          durationInFrames={SCENE_DURATIONS.scene1}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="02-Catalog"
          component={Scene2Catalog}
          durationInFrames={SCENE_DURATIONS.scene2}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="03-Diagnostics"
          component={Scene3Diagnostics}
          durationInFrames={SCENE_DURATIONS.scene3}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="04-Workspace"
          component={Scene4Workspace}
          durationInFrames={SCENE_DURATIONS.scene4}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="05-SellListing"
          component={Scene5SellListing}
          durationInFrames={SCENE_DURATIONS.scene5}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="06-BuyerOrder"
          component={Scene6BuyerOrder}
          durationInFrames={SCENE_DURATIONS.scene6}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="07-DisputeBulk"
          component={Scene7DisputeBulk}
          durationInFrames={SCENE_DURATIONS.scene7}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="08-ArchitectureOutro"
          component={Scene8ArchitectureOutro}
          durationInFrames={SCENE_DURATIONS.scene8}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};

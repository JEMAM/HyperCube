import React from "react";
import { Composition } from "remotion";
import { MainComposition } from "./MainComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainComposition"
        component={MainComposition}
        durationInFrames={2700} // 45 seconds @ 60 fps
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};

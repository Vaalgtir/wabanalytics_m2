import React, { useEffect } from "react";

import { HORIZONTAL_GLOBAL_NAV_HEIGHT } from "@atlaskit/atlassian-navigation";

import styles from "./Home.module.scss";
import axios from "axios";
import Applications from "./Applications/Applications";
// @ts-ignore
import { useTrackEvent } from "vaalgtir_sdk_webanalytics";

interface Props {}

export const Home: React.FC<Props> = () => {
  const { ref } = useTrackEvent({
    tag: "homepage",
    type: "click",
  });

  return (
    <div
      className={styles.view}
      style={{ minHeight: `calc(100vh - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)` }}
    >
      <button ref={ref}>Track event click</button>
      <Applications />
    </div>
  );
};

export default Home;

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// @ts-ignore
import h337 from "heatmap.js";

import { HORIZONTAL_GLOBAL_NAV_HEIGHT } from "@atlaskit/atlassian-navigation";
import {
  ButtonItem,
  Header,
  NavigationContent,
  NavigationHeader,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation";
import Button from "@atlaskit/button/standard-button";
import EmptyState from "@atlaskit/empty-state";

import ShortcutIcon from "@atlaskit/icon/glyph/shortcut";

import styles from "./Heatmaps.module.scss";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {}

export const Heatmaps: React.FC<Props> = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [positions, setPositions] = useState<any>();
  const [application, setApplication] = useState<
    undefined | { name: string; domain: string }
  >();
  const [screenSizes, setScreenSizes] = useState<string[]>();
  const [screenSizeSelected, setScreenSizeSelected] = useState<string>();

  const { applicationId } = useParams();
  const navigate = useNavigate();

  const heatmapInstance = useRef(null);

  const getSizes = useCallback(() => {
    switch (screenSizeSelected) {
      case "sm":
        return { width: 550, height: 400 };
      case "md":
        return { width: 750, height: 500 };
      case "lg":
        return { width: 800, height: 550 };
      case "xl":
        return { width: 850, height: 600 };

      default:
        return { width: 800, height: 600 };
    }
  }, [screenSizeSelected]);

  useEffect(() => {
    axios
      .post(url + "/dashboard/fetchOneApp/" + applicationId)
      .then(({ data }) => {
        setApplication(data);
      });
  }, [applicationId]);

  const fetchLocations = useCallback(async () => {
    const {
      data: { locations },
    } = await axios.post<string, { data: any }>(
      url + "/dashboard/getHeatmapsLocations/" + applicationId
    );

    setPages(locations);
    locations.length > 0 && setSelectedPage(locations[0]);
  }, [applicationId]);

  const fetchSizes = useCallback(async () => {
    const {
      data: { screenSizes },
    } = await axios.post<string, { data: any }>(
      url + "/dashboard/getHeatmapsSizes/" + applicationId,
      { location: selectedPage }
    );

    setScreenSizes(screenSizes);
    screenSizes.length > 0 && setScreenSizeSelected(screenSizes[0]);
  }, [applicationId, selectedPage]);

  const fetchPositions = useCallback(async () => {
    const {
      data: { positions },
    } = await axios.post<string, { data: any }>(
      url + "/dashboard/getHeatmapsPositions/" + applicationId,
      { location: selectedPage, screenSize: screenSizeSelected }
    );

    setPositions(
      positions.map((item: any) => {
        const { x, y, width, height } = item._id;

        return {
          x: Math.round((x / width) * (getSizes()?.width || 1)),
          y: Math.round((y / height) * (getSizes()?.height || 1)),
          value: item.value,
        };
      })
    );
  }, [applicationId, selectedPage, screenSizeSelected, getSizes]);

  useEffect(() => {
    if (applicationId?.length === 36) {
      fetchLocations();
    }
  }, [applicationId, fetchLocations]);

  useEffect(() => {
    if (applicationId?.length === 36 && selectedPage.length > 0) {
      fetchSizes();
    }
  }, [applicationId, fetchSizes, selectedPage]);

  useEffect(() => {
    if (
      applicationId?.length === 36 &&
      selectedPage.length > 0 &&
      screenSizeSelected
    ) {
      setPositions(null);
      fetchPositions();
    }
  }, [applicationId, selectedPage, screenSizeSelected, fetchPositions]);

  useEffect(() => {
    if (
      document.querySelector(".heatmap") &&
      positions &&
      !heatmapInstance.current
    ) {
      heatmapInstance.current = h337.create({
        // only container is required, the rest will be defaults
        container: document.querySelector(".heatmap"),
      });

      let max = 0;
      positions.map((item: any) => {
        if (item.value > max) max = item.value;
      });
      // @ts-ignore
      heatmapInstance.current?.setData({ max, data: positions });
    } else if (heatmapInstance.current && positions) {
      let max = 0;
      positions.map((item: any) => {
        if (item.value > max) max = item.value;
      });

      // @ts-ignore
      heatmapInstance.current.setData({ max, data: positions });
    }
  }, [positions]);

  return (
    <>
      {pages.length > 0 ? (
        <div className={styles.wrapperHeatmap}>
          <div
            className={styles.leftNav}
            style={{
              minHeight: `calc(100vh - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)`,
            }}
          >
            <div
            // style={{ maxWidth: "28vw" }}
            >
              <SideNavigation label="project">
                <NavigationHeader>
                  <Header>Heatmaps disponibles</Header>
                </NavigationHeader>
                <NavigationContent showTopScrollIndicator>
                  <Section>
                    {pages.map((item, key) => (
                      <ButtonItem
                        key={key}
                        onClick={() => {
                          setSelectedPage(item);
                        }}
                        isSelected={item === selectedPage}
                      >
                        {item.slice(0, 10)}
                      </ButtonItem>
                    ))}
                  </Section>
                </NavigationContent>
              </SideNavigation>
            </div>
          </div>
          <div className={styles.wrapperBody}>
            <div className={styles.wrapperButtons}>
              {application && (
                <Button
                  appearance="default"
                  iconBefore={<ShortcutIcon label="" />}
                  onClick={() => {
                    window.open(
                      `${application.domain}${selectedPage}`,
                      "_blank"
                    );
                  }}
                >
                  Voir en ligne
                </Button>
              )}
            </div>
            {selectedPage && (
              <>
                <h1>
                  Heatmap de l'url :{" "}
                  {application
                    ? `${application.domain}${selectedPage}`
                    : selectedPage}
                </h1>
                {screenSizes && screenSizes.length > 1 && (
                  <div className={styles.wrapperSizeChoices}>
                    <div>Taille de heatmaps disponibles : </div>
                    {screenSizes &&
                      screenSizes.map((item) => (
                        <Button
                          isSelected={item === screenSizeSelected}
                          onClick={() => {
                            setScreenSizeSelected(item);
                          }}
                        >
                          {item}
                        </Button>
                      ))}
                  </div>
                )}
                <div
                  className="heatmap"
                  style={{ width: `${getSizes()?.width}px`, height: "600px" }}
                >
                  {application && (
                    <iframe
                      title="heatmap_img"
                      width={`${getSizes()?.width}`}
                      height="600"
                      src={`${application.domain}${selectedPage}`}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          header="Vous n'avez pas de Heatmaps disponibles"
          description="Vous pouvez activer la capture de session via votre SDK avec l'option `withTrackingMouse`, cela génèrera la heatmap"
          primaryAction={
            <Button
              appearance="primary"
              onClick={() => {
                navigate(-1);
              }}
            >
              Retour
            </Button>
          }
          tertiaryAction={
            <Button
              appearance="link"
              onClick={() => {
                window.open("https://www.hotjar.com/heatmaps/", "_blank");
              }}
            >
              Learn more
            </Button>
          }
        />
      )}
    </>
  );
};

export default Heatmaps;

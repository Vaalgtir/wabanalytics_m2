import axios from "axios";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
// @ts-ignore
import GridLayout from "react-grid-layout";

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
import CrossIcon from "@atlaskit/icon/glyph/cross";
import { ModalTransition } from "@atlaskit/modal-dialog";

import CountVisitor from "./KPIs/CountVisitor/CountVisitor";
import AverageTime from "./KPIs/AverageTime/AverageTime";
import CountVisitorLastWeek from "./KPIs/CountVisitorLastWeek/CountVisitorLastWeek";
import BounceRate from "./KPIs/BounceRate/BounceRate";
import PagePerVisitor from "./KPIs/PagePerVisitor/PagePerVisitor";
import KPIEvent from "./KPIs/KPIEvent/KPIEvent";
import GraphVisitorLastWeek from "./KPIs/GraphVisitorLastWeek/GraphVisitorLastWeek";

import TunnelModal from "./Modals/TunnelModal";

import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

import styles from "./Stats.module.scss";
import Tunnels from "./KPIs/Tunnels/Tunnels";
import TunnelsTab from "./KPIs/TunnelsTab/TunnelsTab";
import VisitorPerPageTab from "./KPIs/VisitorPerPageTab/VisitorPerPageTab";
import TopBar from "./TopBar/TopBar";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const sizeKPI = { w: 2, minW: 2, maxW: 4, h: 3, minH: 3, maxH: 4 };
const sizeGraph = { w: 4, minW: 4, maxW: 7, h: 6, minH: 5, maxH: 8 };
const sizeTab = { w: 6, minW: 5, maxW: 7, h: 9, minH: 9, maxH: 10 };

interface Props {}
interface Module {
  label: string;
  config: { key: string };
  component: ReactElement<any, any>;
}

const Stats: React.FC<Props> = () => {
  const [layout, setLayout] = useState<Array<any>>();
  const [newLayout, setNewLayout] = useState<Array<any>>();
  const [editing, setEditing] = useState<boolean>();
  const [isOpenTunnel, setIsOpenTunnel] = useState<boolean>(false);
  const [minDateFilter, setMinDateFilter] = useState<string>();
  const [maxDateFilter, setMaxDateFilter] = useState<string>();
  const [isLastQuarter, setIsLastQuarter] = useState<boolean>();
  const [isLastDay, setIsLastDay] = useState<boolean>();
  const [filter, setFilter] = useState<any>();

  useEffect(() => {
    const filterDate =
      minDateFilter && maxDateFilter ? { minDateFilter, maxDateFilter } : {};
    const filterLastQuarter = isLastQuarter ? { isLastQuarter } : {};
    const filterLastDay = isLastDay ? { isLastDay } : {};

    setFilter({ ...filterDate, ...filterLastQuarter, ...filterLastDay });
  }, [isLastDay, isLastQuarter, maxDateFilter, minDateFilter]);

  const modulesStatic: Module[] = useMemo(() => {
    return [
      {
        label: "KPI |  Nombre de visiteur",
        config: { key: "count_visitor", ...sizeKPI },
        component: <CountVisitor editing={editing || false} filter={filter} />,
      },
      {
        label: "KPI |  Nombre de visiteur | 7 derniers jours",
        config: { key: "count_visitor_lastweek", ...sizeKPI },
        component: (
          <CountVisitorLastWeek editing={editing || false} filter={filter} />
        ),
      },
      {
        label: "KPI | Durée moyenne de visite",
        config: { key: "average_time", ...sizeKPI },
        component: <AverageTime editing={editing || false} filter={filter} />,
      },
      {
        label: "KPI | Bounce Rate",
        config: { key: "bounce_rate", ...sizeKPI },
        component: <BounceRate editing={editing || false} filter={filter} />,
      },
      {
        label: "KPI | Page Views Per Visit",
        config: { key: "page_views_per_visit", ...sizeKPI },
        component: (
          <PagePerVisitor editing={editing || false} filter={filter} />
        ),
      },
      {
        label: "GRAPH | Nombre de visiteur | 7 derniers jours",
        config: { key: "graph_visitor_lastweek", ...sizeGraph },
        component: (
          <GraphVisitorLastWeek editing={editing || false} filter={filter} />
        ),
      },
      {
        label: "TAB | Nombre de visiteur par page",
        config: { key: "tab_count_visitor_per_page", ...sizeTab },
        component: (
          <VisitorPerPageTab editing={editing || false} filter={filter} />
        ),
      },
    ];
  }, [editing, filter]);
  const [modules, setModules] = useState<any>(modulesStatic);

  useEffect(() => {
    setModules(modulesStatic);
  }, [filter, modulesStatic]);

  const { applicationId } = useParams();
  const navigate = useNavigate();

  const moduleNotDisplayed: Module[] = modules.filter((item: Module) => {
    const displayedModule = newLayout?.map((module) => module.i) || [];

    return !displayedModule.includes(item.config.key);
  });

  const fetchLayouts = useCallback(async () => {
    const { data: layoutsRaw } = await axios.post<string, { data: any }>(
      url + "/dashboard/getLayout/" + applicationId
    );

    setEditing(layoutsRaw === "null");

    setLayout(JSON.parse(layoutsRaw));
    setNewLayout(JSON.parse(layoutsRaw));
  }, [applicationId]);

  useEffect(() => {
    if (applicationId?.length === 36) {
      fetchLayouts();
    }
  }, [applicationId, fetchLayouts]);

  useEffect(() => {
    const keyArr = modules.map((item: Module) => item.config.key);

    applicationId &&
      axios
        .post<string, { data: { events: string[] } }>(
          url + "/dashboard/getEvents/" + applicationId
        )
        .then(({ data: { events } }) => {
          events.map((item) => {
            !keyArr.includes(item) &&
              setModules([
                ...modules,
                {
                  label: "KPI | " + item,
                  config: { key: item, ...sizeKPI },
                  component: (
                    <KPIEvent
                      editing={editing || false}
                      name={item}
                      filter={filter}
                    />
                  ),
                },
              ]);
          });
        });
    applicationId &&
      axios
        .post<
          string,
          { data: { tunnels: { name: string; path: string; id: string }[] } }
        >(url + "/dashboard/getConversionTunnel/" + applicationId)
        .then(({ data: { tunnels } }) => {
          tunnels.map((item) => {
            !keyArr.includes(item.id) &&
              setModules([
                ...modules,
                {
                  label: "TC | KPI | " + item.name,
                  config: { key: item.id, ...sizeKPI },
                  component: (
                    <Tunnels
                      editing={editing || false}
                      tunnel={item}
                      filter={filter}
                    />
                  ),
                },
                {
                  label: "TC | TAB | " + item.name,
                  config: { key: item.id + "_tab", ...sizeTab },
                  component: (
                    <TunnelsTab
                      editing={editing || false}
                      tunnel={item}
                      filter={filter}
                    />
                  ),
                },
              ]);
          });
        });
  }, [applicationId, editing, filter, modules]);

  const onDrop = (nextLayout: any, layoutItem: any, _event: any) => {
    const infos = JSON.parse(_event.dataTransfer.getData("text/plain"));

    const { key, ...size } = infos;

    layoutItem.i = key;

    newLayout && setNewLayout([...newLayout, { ...layoutItem, ...size }]);
  };

  const createLayout = async () => {
    axios
      .post<string, { data: any }>(url + "/dashboard/saveLayout", {
        applicationId,
        layout: JSON.stringify(newLayout),
      })
      .then(() => {
        setLayout(newLayout);
        setEditing(false);
      });
  };

  const removeItem = (itemId: any) => {
    setNewLayout(newLayout?.filter((item) => item.i !== itemId));
  };

  return (
    <>
      {editing ? (
        <div className={styles.wrapperEditing}>
          <div
            className={styles.leftNav}
            style={{
              minHeight: `calc(100vh - ${HORIZONTAL_GLOBAL_NAV_HEIGHT}px)`,
            }}
          >
            <div>
              <SideNavigation label="project">
                <NavigationHeader>
                  <Header>Vos données</Header>
                </NavigationHeader>
                <NavigationContent showTopScrollIndicator>
                  <Section>
                    <Button
                      appearance="primary"
                      onClick={() => {
                        setIsOpenTunnel(true);
                      }}
                    >
                      Créer un tunnel de conversion
                    </Button>
                  </Section>
                  <Section>
                    {moduleNotDisplayed.map((item, index) => (
                      <div
                        key={index}
                        className={styles.draggableItem}
                        draggable={true}
                        unselectable="on"
                        // this is a hack for firefox
                        // Firefox requires some kind of initialization
                        // which we can do by adding this attribute
                        // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                        onDragStart={(e) =>
                          e.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify(item.config)
                          )
                        }
                      >
                        {item.label}
                      </div>
                    ))}
                  </Section>
                </NavigationContent>
              </SideNavigation>
            </div>
          </div>

          <div className={styles.wrapperBody}>
            <div className={styles.wrapperButtons}>
              <Button appearance="primary" onClick={createLayout}>
                Enregistrer votre dashboard
              </Button>
              <Button
                appearance="subtle"
                onClick={() => {
                  setNewLayout(layout);
                  setEditing(false);
                }}
              >
                Annuler
              </Button>
            </div>
            <GridLayout
              className={`${styles.layout} ${editing && styles.layoutEdit}`}
              layout={newLayout}
              cols={12}
              rowHeight={30}
              width={1200}
              height={1200}
              onDrop={onDrop}
              isDroppable={true}
              onLayoutChange={(changedLayout: any) => {
                setNewLayout(
                  changedLayout.filter(
                    (item: any) => item.i !== "__dropping-elem__"
                  )
                );
              }}
            >
              {newLayout &&
                newLayout?.map((item) => (
                  <div key={item.i}>
                    {modules.find((modu: Module) => modu.config.key === item.i)
                      ?.component || item.i}
                    <span
                      className={styles.deleteItem}
                      onClick={() => {
                        removeItem(item.i);
                      }}
                    >
                      <CrossIcon label="close" />
                    </span>
                  </div>
                ))}
            </GridLayout>
          </div>
        </div>
      ) : (
        <div className={`${styles.wrapperEditing} ${styles.wrapperNotEditing}`}>
          <TopBar
            minDateFilter={minDateFilter}
            maxDateFilter={maxDateFilter}
            isLastQuarter={isLastQuarter}
            isLastDay={isLastDay}
            setMinDateFilter={setMinDateFilter}
            setMaxDateFilter={setMaxDateFilter}
            setIsLastQuarter={setIsLastQuarter}
            setIsLastDay={setIsLastDay}
          />
          <div className={styles.wrapperBody}>
            <div className={styles.wrapperButtons}>
              <Button
                appearance="primary"
                onClick={() => {
                  setEditing(true);
                }}
              >
                Modifier votre dashboard
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  navigate("heatmaps", { replace: false });
                }}
                style={{ margin: "0 1vw" }}
              >
                Heatmaps
              </Button>
            </div>
            <GridLayout
              isDraggable={false}
              isResizable={false}
              isDroppable={false}
              className={styles.layout}
              layout={layout}
              cols={12}
              rowHeight={30}
              width={1200}
              onLayoutChange={() => {}}
            >
              {layout &&
                layout?.map((item) => (
                  <div
                    key={item.i}
                    onMouseDown={(e) => {
                      !editing && e.stopPropagation();
                    }}
                  >
                    {modules.find((modu: Module) => modu.config.key === item.i)
                      ?.component || item.i}
                  </div>
                ))}
            </GridLayout>
          </div>
        </div>
      )}

      <ModalTransition>
        <TunnelModal
          isOpenTunnel={isOpenTunnel}
          setIsOpenTunnel={setIsOpenTunnel}
        />
      </ModalTransition>
    </>
  );
};

export default Stats;

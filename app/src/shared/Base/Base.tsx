import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { fetchUser, setState } from "../../Redux/States/users";

import {
  AtlassianNavigation,
  PrimaryButton,
  ProductHome,
  Profile,
} from "@atlaskit/atlassian-navigation";
import { AtlassianIcon } from "@atlaskit/logo";
import Avatar from "@atlaskit/avatar";
import Badge from "@atlaskit/badge";
import Popup from "@atlaskit/popup";
import EmptyState from "@atlaskit/empty-state";
import { ButtonItem, MenuGroup, Section } from "@atlaskit/menu";

import styles from "./Base.module.scss";
import Connection from "../../pages/Connection/Connection";

interface Props {
  checkingToken: boolean;
  children: React.ReactNode;
}

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

export const Base: React.FC<Props> = ({ checkingToken, children }) => {
  const [isModalConnectionShown, setIsModalConnectionShown] =
    useState<boolean>(true);
  const [isPopupProfilOpen, setIsPopupSettingsOpen] = useState<boolean>(false);

  const user = useSelector(fetchUser);
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const params = new URLSearchParams(document.location.search);
  const mailParams = params.get("mailValid");

  useEffect(() => {
    setIsModalConnectionShown(!user.isConnected);
  }, [user.isConnected, mailParams, user.isValidated]);

  const AtlassianProductHome = () => (
    <ProductHome
      icon={AtlassianIcon}
      logo={AtlassianIcon}
      siteTitle={"WebAnalytics"}
      onClick={() => {
        navigate("/", { replace: true });
      }}
    />
  );

  const DefaultProfile = () => {
    const flNom = user?.Nom && user?.Nom[0];
    const flPrenom = user?.Prenom && user?.Prenom[0];

    return (
      <Popup
        isOpen={isPopupProfilOpen}
        onClose={() => setIsPopupSettingsOpen(false)}
        placement="bottom-end"
        content={() => (
          <MenuGroup
            maxWidth={800}
            minWidth={150}
            onClick={(e) => e.stopPropagation()}
          >
            <Section>
              <ButtonItem
                onClick={() => {
                  navigate("/profile", { replace: true });
                  setIsPopupSettingsOpen(false);
                }}
              >
                Profile
              </ButtonItem>
            </Section>
            <Section>
              <ButtonItem
                onClick={() => {
                  handleLogout();
                }}
              >
                Logout
              </ButtonItem>
            </Section>
          </MenuGroup>
        )}
        trigger={(triggerProps) => (
          <Profile
            {...triggerProps}
            icon={
              flNom && flPrenom ? (
                <div className={styles.badge}>
                  <Badge>{`${flNom}${flPrenom}`.toUpperCase()}</Badge>
                </div>
              ) : (
                <Avatar size="small" />
              )
            }
            onClick={() => {
              setIsPopupSettingsOpen(!isPopupProfilOpen);
            }}
            tooltip=""
          />
        )}
      />
    );
  };

  const navButtons: JSX.Element[] = [
    <PrimaryButton
      onClick={() => {
        navigate("/");
      }}
    >
      Listes des Apps
    </PrimaryButton>,
  ];

  const navButtonsAdmins: JSX.Element[] = user.isAdmin ? [] : [];

  const handleLogout = () => {
    localStorage.removeItem("TOKEN");
    setIsPopupSettingsOpen(false);

    dispatch(
      setState({
        isConnected: false,
        id: 0,
        username: "",
        accessToken: "",
        mail: "",
        isAdmin: false,
        isValidated: false,
        isBannished: false,
        Nom: "",
        Prenom: "",
      })
    );
  };

  return (
    <>
      {checkingToken ? (
        <div className={styles.checkingToken}>
          <div>
            Nous sommes entrains de vérifier l&#39;état de votre connexion
          </div>
          <div>Cela peut prendre quelques secondes</div>
        </div>
      ) : isModalConnectionShown ? (
        <Connection />
      ) : (
        <>
          <div className={styles.navBar}>
            <AtlassianNavigation
              label="site"
              primaryItems={[...navButtons, ...navButtonsAdmins]}
              renderProfile={DefaultProfile}
              renderProductHome={AtlassianProductHome}
            />
          </div>

          {children}
        </>
      )}
    </>
  );
};

export default Base;

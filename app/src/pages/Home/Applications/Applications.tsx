import axios from "axios";
import React, { Fragment, useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { Field, HelperMessage } from "@atlaskit/form";
import Textfield from "@atlaskit/textfield";
import EmptyState from "@atlaskit/empty-state";
import Button from "@atlaskit/button/standard-button";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
// @ts-ignore
import DynamicTable from "@atlaskit/dynamic-table";
import { AutoDismissFlag, FlagGroup } from "@atlaskit/flag";

import SuccessIcon from "@atlaskit/icon/glyph/check-circle";
import CopyIcon from "@atlaskit/icon/glyph/copy";
import TrashIcon from "@atlaskit/icon/glyph/trash";
import GraphBarIcon from "@atlaskit/icon/glyph/graph-bar";
import EditIcon from "@atlaskit/icon/glyph/edit";

import styles from "./Applications.module.scss";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {}

const Applications: React.FC<Props> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [applications, setApplications] = useState<Array<any>>([]);
  const [appToDelete, setAppToDelete] = useState<any>([]);
  const [appToEdit, setAppToEdit] = useState<any>([]);
  // prettier-ignore
  const [flags, setFlags] = React.useState<Array<{ content: string; icon: any; appearance: any }>>([]);

  const navigate = useNavigate();

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const openModalDelete = (appId: string) => {
    setIsOpenDelete(true);
    setAppToDelete(appId);
  };
  const openModalEdit = (app: any) => {
    setIsOpenEdit(true);
    setAppToEdit(app);
  };

  const closeModalDelete = useCallback(() => {
    setIsOpenDelete(false);
    setAppToDelete("");
  }, []);
  const closeModalEdit = useCallback(() => {
    setIsOpenEdit(false);
    setAppToEdit("");
  }, []);

  useEffect(() => {
    axios.post(url + "/dashboard/fetchApps").then(({ data }) => {
      setApplications(data);
    });
  }, []);

  const onSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      const obj: any = {};
      data.forEach((val, key) => {
        obj[key] = val;
      });

      if (obj.name.length > 0) {
        axios
          .post(url + "/dashboard/createApp", {
            name: obj.name,
            domain: obj.domain,
          })
          .then(({ data }) => {
            setApplications([...applications, data]);
            setIsOpen(false);
          });
      }
    },
    [applications]
  );

  const onSubmitEdit = useCallback(
    (e: any) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      const obj: any = {};
      data.forEach((val, key) => {
        obj[key] = val;
      });

      if (obj.name.length > 0) {
        axios
          .post(url + "/dashboard/editApp/" + appToEdit.id, {
            name: obj.name,
            domain: obj.domain,
          })
          .then(({ data }) => {
            const repApp = [...applications];
            const index = repApp.findIndex((item) => (item.id = appToEdit.id));

            repApp[index] = data;

            setApplications(repApp);
            setIsOpenEdit(false);
          });
      }
    },
    [appToEdit]
  );

  const onDelete = () => {
    if (appToDelete.length > 0) {
      axios
        .delete(url + "/dashboard/applications/" + appToDelete)
        .then(() => {
          const newApps = applications.slice();
          setApplications(newApps.filter((item) => item.id !== appToDelete));

          closeModalDelete();
        })
        .catch((err) => {
          console.log("debug", err);
        });
    }
  };

  const addFlag = (bodyFlag: {
    content: string;
    icon: any;
    appearance: string;
  }) => {
    const newFlags = flags.slice(0, 0);
    newFlags.splice(0, 0, bodyFlag);

    setFlags(newFlags);
  };

  const handleDismiss = () => {
    setFlags(flags.slice(1));
  };

  const head = {
    cells: [
      {
        key: "name",
        content: "Name",
        isSortable: true,
        shouldTruncate: true,
        width: 25,
      },
      {
        key: "domain",
        content: "Domain",
        isSortable: true,
        shouldTruncate: true,
        width: 25,
      },
      {
        key: "id",
        content: "Id",
        width: 25,
      },
      {
        key: "actions",
        content: "Actions",
        width: 35,
      },
    ],
  };

  const rows = applications.map((item: any, index: any) => ({
    key: `row-${index}`,
    isHighlighted: false,
    cells: [
      {
        key: "name",
        content: item.name,
      },
      {
        key: "domain",
        content: item.domain,
      },
      {
        key: "id",
        content: item.id.slice(0, 10) + "...",
      },
      {
        key: " actions",
        content: (
          <div className={styles.wrapperActions}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(item.id).then(() => {
                  addFlag({
                    content: "Id copié",
                    icon: (
                      <SuccessIcon
                        primaryColor="#22A06B"
                        label="Success"
                        size="medium"
                      />
                    ),
                    appearance: "default",
                  });
                });
              }}
              iconBefore={<CopyIcon label="copy" size="medium" />}
            ></Button>

            <Button
              onClick={() => {
                openModalEdit(item);
              }}
              className={styles.editAction}
              iconBefore={<EditIcon label="delete" size="medium" />}
            ></Button>

            <Button
              appearance="danger"
              onClick={() => {
                openModalDelete(item.id);
              }}
              iconBefore={<TrashIcon label="delete" size="medium" />}
            ></Button>
            <Button
              appearance="primary"
              onClick={() => {
                navigate("stats/" + item.id, { replace: true });
              }}
              iconBefore={<GraphBarIcon label="navigate" size="medium" />}
            ></Button>
          </div>
        ),
      },
    ],
  }));

  return (
    <>
      {applications.length === 0 ? (
        <EmptyState
          header="Vous n'avez pas d'applications"
          description="N'attendez pas pour en créer une !"
          primaryAction={
            <Button appearance="primary" onClick={openModal}>
              Générer votre identifiant d'application
            </Button>
          }
        />
      ) : (
        <div className={styles.wrapperApp}>
          <div className={styles.wrapperAddApp}>
            <Button onClick={openModal} appearance="primary">
              Ajouter une application
            </Button>
          </div>
          <div className={styles.wrapperTable}>
            <DynamicTable
              head={head}
              rows={rows}
              rowsPerPage={5}
              defaultPage={1}
              loadingSpinnerSize="large"
              isRankable
            />
          </div>
        </div>
      )}
      <ModalTransition>
        {isOpen && (
          <Modal onClose={closeModal}>
            <form onSubmit={onSubmit}>
              <ModalHeader>
                <ModalTitle>Nouvelle application</ModalTitle>
              </ModalHeader>
              <ModalBody>
                <Field
                  id="name"
                  name="name"
                  label="Entrer le nom de cette application"
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <Textfield {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
                <Field id="domain" name="domain" label="Entrer l'url">
                  {({ fieldProps }) => (
                    <Fragment>
                      <Textfield {...fieldProps} />
                    </Fragment>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button appearance="subtle" onClick={closeModal}>
                  Annuler
                </Button>
                <Button appearance="primary" type="submit">
                  Générer
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        )}

        {isOpenEdit && (
          <Modal onClose={closeModalEdit}>
            <form onSubmit={onSubmitEdit}>
              <ModalHeader>
                <ModalTitle>Nouvelle application</ModalTitle>
              </ModalHeader>
              <ModalBody>
                <Field
                  id="name"
                  name="name"
                  label="Entrer le nom de cette application"
                >
                  {({ fieldProps }) => (
                    <Fragment>
                      <Textfield
                        {...fieldProps}
                        defaultValue={appToEdit.name}
                      />
                    </Fragment>
                  )}
                </Field>
                <Field id="domain" name="domain" label="Entrer l'url">
                  {({ fieldProps }) => (
                    <Fragment>
                      <Textfield
                        {...fieldProps}
                        defaultValue={appToEdit.domain}
                      />
                    </Fragment>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button appearance="subtle" onClick={closeModalEdit}>
                  Annuler
                </Button>
                <Button appearance="primary" type="submit">
                  Générer
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        )}

        {isOpenDelete && (
          <Modal onClose={closeModalDelete}>
            <ModalHeader>
              <ModalTitle appearance="danger">
                Êtes-vous sûr de vouloir supprimer cette page ?
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>
                Cela entraînera la suppression de toutes les données liées à
                cette application.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={closeModalDelete}>
                Annuler
              </Button>
              <Button appearance="danger" type="submit" onClick={onDelete}>
                Supprimer
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

      <FlagGroup onDismissed={handleDismiss}>
        {flags.map((item, index) => {
          return (
            <AutoDismissFlag
              id={index}
              icon={item.icon}
              key={index}
              title={item.content}
              appearance={item.appearance}
              // description={item.description}
            />
          );
        })}
      </FlagGroup>
    </>
  );
};

export default Applications;

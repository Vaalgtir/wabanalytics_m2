import React, { Fragment, useEffect, useState } from "react";

import { Field, HelperMessage } from "@atlaskit/form";
import Textfield from "@atlaskit/textfield";
import EmptyState from "@atlaskit/empty-state";
import Button from "@atlaskit/button/standard-button";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@atlaskit/modal-dialog";
import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import Pagination from "@atlaskit/pagination";

import AddCircleIcon from "@atlaskit/icon/glyph/add-circle";
import TrashIcon from "@atlaskit/icon/glyph/trash";

import styles from "./TunnelModal.module.scss";
import { useParams } from "react-router-dom";
import axios from "axios";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

const numberItemPerPage = 4;

interface Props {
  isOpenTunnel: boolean;
  setIsOpenTunnel: (isOpen: boolean) => void;
}

export const TunnelModal: React.FC<Props> = ({
  isOpenTunnel,
  setIsOpenTunnel,
}) => {
  const [value, setValue] = useState<string>("");
  const [path, setPath] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [application, setApplication] = useState<
    undefined | { name: string; domain: string }
  >();

  const { applicationId } = useParams();

  useEffect(() => {
    axios
      .post(url + "/dashboard/fetchOneApp/" + applicationId)
      .then(({ data }) => {
        setApplication(data);
      });
  }, [applicationId]);

  const closeModalTunnel = () => {
    setIsOpenTunnel(false);
    setValue("");
    setPath([]);
  };

  const onSubmit = () => {
    if (path.length > 0) {
      axios
        .post(url + "/dashboard/createTunnelConversion/" + applicationId, {
          path: JSON.stringify(path),
          name,
        })
        .then(() => {
          closeModalTunnel();
        });
    }
  };

  const handleKeyDown = (event: any) => {
    event.stopPropagation();

    if (event.key === "Enter") {
      addPath();
    }

    if (
      (event.key === "Delete" || event.key === "Backspace") &&
      value.length === 0
    ) {
      removePath();
    }
  };
  const addPath = () => {
    if (value.length > 0) {
      setPath([...path, value]);
      setValue("");
    }
  };

  const removePath = () => {
    const arrRep = [...path];
    arrRep.pop();

    setPath(arrRep);

    if (
      pageIndex * numberItemPerPage > arrRep.length - 1 &&
      arrRep.length !== 0
    ) {
      setPageIndex(pageIndex - 1);
    }
  };

  const calcPageNumber = () => {
    var tableau = [];
    const correctif = path.length % numberItemPerPage !== 0 ? 1 : 0;
    const pages = Math.trunc(path.length / numberItemPerPage) + correctif;

    for (var i = 1; i <= pages; i++) {
      tableau.push(i);
    }

    return tableau;
  };

  const page = calcPageNumber();

  return (
    <>
      {isOpenTunnel && (
        <Modal onClose={closeModalTunnel}>
          <ModalHeader>
            <ModalTitle>Nouveau tunnel de conversion</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Textfield
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
              placeholder="Nom du tunnel"
              className={styles.nameTunnel}
            />

            <div className={styles.wrapperInput}>
              <Textfield
                value={value}
                onChange={(e) => {
                  setValue(e.currentTarget.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Entrer les pages dans l'ordre"
              />
              <Button
                iconBefore={<AddCircleIcon label="add" size="medium" />}
                onClick={() => {
                  addPath();
                }}
              />

              <Button
                appearance="danger"
                iconBefore={<TrashIcon label="delete" size="medium" />}
                onClick={() => {
                  removePath();
                }}
              />
            </div>

            {path
              .slice(
                pageIndex * numberItemPerPage,
                (pageIndex + 1) * numberItemPerPage
              )
              .map((item, index) => (
                <div className={styles.steps}>
                  <h4>Étape {pageIndex * numberItemPerPage + index}</h4>
                  {
                    // @ts-ignore
                    <Breadcrumbs>
                      <span className={styles.urls}>
                        <span>{application?.domain}</span>
                        <BreadcrumbsItem text={`${item}`} />
                      </span>
                    </Breadcrumbs>
                  }
                </div>
              ))}
            <div className={styles.pagination}>
              {page.length > 1 && path.length > 4 && (
                <Pagination
                  nextLabel="Next"
                  label="Page"
                  pageLabel="Page"
                  pages={page}
                  previousLabel="Previous"
                  onChange={(e, page) => {
                    e.preventDefault();
                    setPageIndex(page - 1);
                  }}
                  selectedIndex={pageIndex}
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={closeModalTunnel}>
              Annuler
            </Button>
            <Button
              appearance="primary"
              onClick={() => {
                onSubmit();
              }}
            >
              Créer
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default TunnelModal;

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";

import { DatePicker } from "@atlaskit/datetime-picker";
import Tag from "@atlaskit/tag";
import Button from "@atlaskit/button/standard-button";

import ArrowRightIcon from "@atlaskit/icon/glyph/arrow-right";

import styles from "./TopBar.module.scss";
import { useParams } from "react-router-dom";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {
  minDateFilter: string | undefined;
  maxDateFilter: string | undefined;
  isLastQuarter: boolean | undefined;
  isLastDay: boolean | undefined;
  setMinDateFilter: (value?: string) => void;
  setMaxDateFilter: (value?: string) => void;
  setIsLastQuarter: (value?: boolean) => void;
  setIsLastDay: (value?: boolean) => void;
}

export const TopBar: React.FC<Props> = ({
  minDateFilter,
  maxDateFilter,
  isLastQuarter,
  isLastDay,
  setMinDateFilter,
  setMaxDateFilter,
  setIsLastQuarter,
  setIsLastDay,
}) => {
  const [minDate, setMinDate] = useState<any>();

  const today = dayjs().format("YYYY-MM-DD");

  const { applicationId } = useParams();

  useEffect(() => {
    if (applicationId) {
      axios
        .post<string, { data: { minDateReq: string } }>(
          url + "/dashboard/minDateStats/" + applicationId
        )
        .then(({ data: { minDateReq } }) => {
          setMinDate(dayjs(minDateReq).format("YYYY-MM-DD"));
        });
    }
  }, [applicationId]);

  return (
    <div className={styles.wrapperBar}>
      <div className={styles.wrapperTags}>
        {(minDateFilter || maxDateFilter || isLastQuarter || isLastDay) && (
          <span>Filtres appliqués : </span>
        )}
        {minDateFilter && maxDateFilter && (
          // @ts-ignore
          <Tag
            text="Dates personnalisées"
            removeButtonLabel="Remove"
            onAfterRemoveAction={() => {
              setMaxDateFilter();
              setMinDateFilter();
            }}
            color="greenLight"
          />
        )}
        {isLastQuarter && (
          // @ts-ignore
          <Tag
            text="Dernière 15min"
            removeButtonLabel="Remove"
            onAfterRemoveAction={() => {
              setIsLastQuarter(false);
            }}
            color="blueLight"
          />
        )}
        {isLastDay && (
          // @ts-ignore
          <Tag
            text="Dernier jour"
            removeButtonLabel="Remove"
            onAfterRemoveAction={() => {
              setIsLastDay(false);
            }}
            color="purpleLight"
          />
        )}
      </div>
      <div className={styles.wrapperFilter}>
        <div className={styles.wrapperDatePicker}>
          {
            // @ts-ignore
            <DatePicker
              locale="fr-FR"
              minDate={minDate}
              maxDate={maxDateFilter || today}
              dateFormat="YYYY-MM-DD"
              value={minDateFilter}
              onChange={(value: string) => {
                setMinDateFilter(value);

                setIsLastQuarter(false);
                setIsLastDay(false);
              }}
            />
          }
          <ArrowRightIcon label="" size="small" />
          {
            // @ts-ignore
            <DatePicker
              locale="fr-FR"
              minDate={minDateFilter || minDate}
              maxDate={today}
              value={maxDateFilter}
              onChange={(value: string) => {
                setMaxDateFilter(value);

                setIsLastQuarter(false);
                setIsLastDay(false);
              }}
            />
          }
        </div>
        <Button
          onClick={() => {
            setIsLastQuarter(true);

            setIsLastDay(false);
            setMaxDateFilter();
            setMinDateFilter();
          }}
        >
          Dernière 15 min
        </Button>
        <Button
          onClick={() => {
            setIsLastDay(true);

            setIsLastQuarter(false);
            setMaxDateFilter();
            setMinDateFilter();
          }}
        >
          Dernier jour
        </Button>
      </div>
    </div>
  );
};

export default TopBar;

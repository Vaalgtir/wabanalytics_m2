import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// @ts-ignore
import DynamicTable from "@atlaskit/dynamic-table";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {
  editing: boolean;
  tunnel: { path: string; name: string } | undefined;
  filter: object;
}

const TunnelsTab: React.FC<Props> = ({ editing, tunnel, filter }) => {
  const [detailConversion, setDetailConversion] = useState<
    { successRate: number }[]
  >([]);

  const { applicationId } = useParams();

  const fetchAverage = useCallback(async () => {
    if (filter) {
      const {
        data: { detailConversion },
      } = await axios.post<
        string,
        { data: { detailConversion: { successRate: number }[] } }
      >(url + "/dashboard/tunnelConversionTab/" + applicationId, {
        path: tunnel?.path,
        filter: { ...filter },
      });

      setDetailConversion(detailConversion);
    }
  }, [applicationId, filter, tunnel?.path]);

  useEffect(() => {
    if (applicationId?.length === 36) {
      fetchAverage();
    }
  }, [applicationId?.length, fetchAverage]);

  const head = {
    cells: [
      {
        key: "path",
        content: "URL",
        isSortable: false,
        shouldTruncate: true,
        width: 25,
      },
      {
        key: "rate",
        content: "Taux de visiteur",
        isSortable: false,
        shouldTruncate: true,
        width: 25,
      },
    ],
  };

  const rows = Object.entries(detailConversion).map(
    (item: any, index: any) => ({
      key: `row-${index}`,
      isHighlighted: false,
      cells: [
        {
          key: "path",
          content: item[0],
        },
        {
          key: "rate",
          content: `${item[1].successRate}%`,
        },
      ],
    })
  );

  return (
    <div
      onMouseDown={(e) => {
        !editing && e.stopPropagation();
      }}
    >
      <div>
        <DynamicTable
          head={head}
          rows={rows}
          rowsPerPage={3}
          defaultPage={1}
          loadingSpinnerSize="large"
          isRankable
        />
      </div>
      <div className="label">
        Tableau de détail de chaque étapes{" "}
        {tunnel ? "de " + tunnel?.name : "du Tunnel de conversion"}
      </div>
    </div>
  );
};

export default TunnelsTab;

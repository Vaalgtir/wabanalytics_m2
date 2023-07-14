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
  filter: object;
}

const VisitorPerPageTab: React.FC<Props> = ({ editing, filter }) => {
  const [visitorPerPage, setVisitorPerPage] = useState<
    { successRate: number }[]
  >([]);

  const { applicationId } = useParams();

  const fetchAverage = useCallback(async () => {
    if (filter) {
      const {
        data: { visitorPerPage },
      } = await axios.post<
        string,
        { data: { visitorPerPage: { successRate: number }[] } }
      >(url + "/dashboard/visitorPerPageTab/" + applicationId, { filter });

      setVisitorPerPage(visitorPerPage);
    }
  }, [applicationId, filter]);

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
        key: "count",
        content: "Nombre de visiteur",
        isSortable: false,
        shouldTruncate: true,
        width: 25,
      },
    ],
  };

  const rows = visitorPerPage.map((item: any, index: any) => ({
    key: `row-${index}`,
    isHighlighted: false,
    cells: [
      {
        key: "path",
        content: item.location,
      },
      {
        key: "count",
        content: item.visitorCount.length,
      },
    ],
  }));

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
      <div className="label">Nombre de visiteur par page</div>
    </div>
  );
};

export default VisitorPerPageTab;

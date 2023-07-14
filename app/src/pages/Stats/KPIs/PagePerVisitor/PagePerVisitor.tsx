import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {
  editing: boolean;
  filter: object;
}

const PagePerVisitor: React.FC<Props> = ({ editing, filter }) => {
  const [countPage, setCountPage] = useState(0);

  const { applicationId } = useParams();

  const fetchRate = useCallback(async () => {
    if (filter) {
      const {
        data: { countPage },
      } = await axios.post<string, { data: { countPage: number } }>(
        url + "/dashboard/pagePerVisitor/" + applicationId,
        { filter }
      );

      setCountPage(countPage);
    }
  }, [applicationId, filter]);

  useEffect(() => {
    if (applicationId?.length === 36) {
      fetchRate();
    }
  }, [applicationId?.length, fetchRate]);

  return (
    <div
      onMouseDown={(e) => {
        !editing && e.stopPropagation();
      }}
    >
      <div className="value" style={{ color: "rgb(136 186 70)" }}>
        {countPage}
      </div>
      <div className="label">Page Views per visit</div>
    </div>
  );
};

export default PagePerVisitor;

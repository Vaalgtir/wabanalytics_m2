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

const BounceRate: React.FC<Props> = ({ editing, filter }) => {
  const [bounceRate, setBounceRate] = useState(0);

  const { applicationId } = useParams();

  const fetchRate = useCallback(async () => {
    if (filter) {
      const {
        data: { bounceRate },
      } = await axios.post<string, { data: { bounceRate: number } }>(
        url + "/dashboard/bounceRate/" + applicationId,
        { filter }
      );

      setBounceRate(bounceRate);
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
        {bounceRate}%
      </div>
      <div className="label">Bounce Rate</div>
    </div>
  );
};

export default BounceRate;

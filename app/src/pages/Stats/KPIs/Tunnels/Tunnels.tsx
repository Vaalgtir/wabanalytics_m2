import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {
  editing: boolean;
  tunnel: { path: string; name: string } | undefined;
  filter: object;
}

const Tunnels: React.FC<Props> = ({ editing, tunnel, filter }) => {
  const [successRate, setSuccessRate] = useState(0);

  const { applicationId } = useParams();

  const fetchAverage = useCallback(async () => {
    if (filter) {
      const {
        data: { successRate },
      } = await axios.post<string, { data: { successRate: number } }>(
        url + "/dashboard/tunnelConversionrate/" + applicationId,
        {
          path: tunnel?.path,
          filter: { ...filter },
        }
      );

      setSuccessRate(successRate);
    }
  }, [applicationId, filter, tunnel?.path]);

  useEffect(() => {
    if (applicationId?.length === 36) {
      fetchAverage();
    }
  }, [applicationId?.length, fetchAverage]);

  return (
    <div
      onMouseDown={(e) => {
        !editing && e.stopPropagation();
      }}
    >
      <div className="value" style={{ color: "#ba9946" }}>
        {Math.round(successRate)}%
      </div>
      <div className="label">
        Taux de succès{" "}
        {tunnel ? "de " + tunnel?.name : "du Tunnel de conversion"}
      </div>
    </div>
  );
};

export default Tunnels;

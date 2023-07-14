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

const AverageTime: React.FC<Props> = ({ editing, filter }) => {
  const [averageTime, setAverageTime] = useState(0);

  const { applicationId } = useParams();

  const fetchAverage = useCallback(async () => {
    if (filter) {
      const {
        data: { averageTime },
      } = await axios.post<string, { data: { averageTime: number } }>(
        url + "/dashboard/averageTime/" + applicationId,
        { filter }
      );

      setAverageTime(averageTime);
    }
  }, [applicationId, filter]);

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
        {Math.round(averageTime)}
      </div>
      <div className="label">minutes</div>
    </div>
  );
};

export default AverageTime;

import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {
  name: string;
  editing: boolean;
  filter: object;
}

const KPIEvent: React.FC<Props> = ({ name, editing, filter }) => {
  const [count, setCount] = useState(0);

  const { applicationId } = useParams();

  const fetchRate = useCallback(async () => {
    if (filter) {
      const {
        data: { count },
      } = await axios.post<string, { data: { count: number } }>(
        url + "/dashboard/countEvents/" + applicationId,
        {
          name,
          filter: { ...filter },
        }
      );

      setCount(count);
    }
  }, [applicationId, filter, name]);

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
        {count}
      </div>
      <div className="label">nombre de {name}</div>
    </div>
  );
};

export default KPIEvent;

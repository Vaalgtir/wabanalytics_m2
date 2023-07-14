import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const url =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_URL_PROD
    : process.env.REACT_APP_URL_DEV;

interface Props {
  editing: boolean;
  filter: object;
}

const GraphVisitorLastWeek: React.FC<Props> = ({ editing, filter }) => {
  const [dataGraph, setDataGraph] = useState<any>();

  const { applicationId } = useParams();

  const fetchCount = useCallback(async () => {
    if (filter) {
      const {
        data: { dataGraph: resData },
      } = await axios.post<string, { data: { dataGraph: any } }>(
        url + "/dashboard/graphVisitorLastWeek/" + applicationId,
        { filter }
      );

      const labels = resData.map((item: any) => item.date);
      const values = resData.map((item: any) => item.visitorCount);

      const newData = {
        labels: labels,
        datasets: [
          {
            label: "Vistor",
            data: values,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };

      setDataGraph(newData);
    }
  }, [applicationId, filter]);

  useEffect(() => {
    if (applicationId?.length === 36) {
      fetchCount();
    }
  }, [applicationId?.length, fetchCount]);

  const optionsGraph = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div
      onMouseDown={(e) => {
        !editing && e.stopPropagation();
      }}
    >
      <div className="value" style={{ color: "rgb(136 186 70)" }}>
        {dataGraph && <Line options={optionsGraph} data={dataGraph} />}
      </div>
      <div className="label">visiteurs 7 derniers jours</div>
    </div>
  );
};

export default GraphVisitorLastWeek;

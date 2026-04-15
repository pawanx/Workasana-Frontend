import Layout from "../components/Layout";
import "../styles/reports.css";
import { useState, useEffect } from "react";
import axios from "axios";

// Chart.js
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";

import { Bar, Pie, Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  ChartDataLabels,
);

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const BASE_URL = "https://workasana-backend-khaki.vercel.app";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${BASE_URL}/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReportData(res.data);
      } catch (error) {
        console.log("Error fetching reports", error);
      }
    };

    fetchReports();
  }, []);

  // 🎨 Colors
  const generateColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  };

  const colors = generateColors(reportData?.tasksByOwner?.length || 0);

  // 📊 Data
  const BarData = {
    labels: reportData?.tasksByTeam?.map((t) => t._id) || [],
    datasets: [
      {
        label: "Tasks",
        data: reportData?.tasksByTeam?.map((t) => t.count) || [],
        backgroundColor: ["#4a6cf7"],
      },
    ],
  };

  const pieData = {
    labels: reportData?.tasksByOwner?.map((o) => o._id) || [],
    datasets: [
      {
        data: reportData?.tasksByOwner?.map((o) => o.count) || [],
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const lineData = {
    labels: reportData?.weeklyTasks?.map((w) => daysMap[w._id - 1]) || [],
    datasets: [
      {
        label: "Tasks Completed",
        data: reportData?.weeklyTasks?.map((w) => w.count) || [],
        borderColor: "#4a6cf7",
        fill: false,
      },
    ],
  };

  // ⚙️ Options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      datalabels: { display: false },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // ❌ disabled
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label;
            const value = context.raw;

            const total = context.chart.data.datasets[0].data.reduce(
              (a, b) => a + b,
              0,
            );

            const percent = ((value / total) * 100).toFixed(0);

            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
      datalabels: { display: false },
    },
  };

  if (!reportData) return <p>Loading reports...</p>;

  const total = reportData.tasksByOwner.reduce((a, b) => a + b.count, 0);

  return (
    <Layout>
      <div className="reports-container">
        <h2>Reports</h2>

        <div className="reports-grid">
          {/* Bar */}
          <div className="chart-card">
            <h4>Total Work Done Last Week</h4>
            <div className="chart-wrapper">
              <Bar data={BarData} options={commonOptions} />
            </div>
          </div>

          {/* Pie + Custom Legend */}
          <div className="chart-card">
            <h4>Total Days of Work Pending</h4>

            <div className="pie-container">
              {/* Pie */}
              <div className="pie-chart">
                <Pie data={pieData} options={pieOptions} />
              </div>

              {/* Legend */}
              <div className="pie-legend">
                {reportData.tasksByOwner.map((item, index) => {
                  const percent = ((item.count / total) * 100).toFixed(0);

                  return (
                    <div key={index} className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="legend-text">{item._id}</span>
                      <span className="legend-value">
                        {item.count} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Line */}
          <div className="chart-card">
            <h4>Tasks Closed by Team</h4>
            <div className="chart-wrapper">
              <Line data={lineData} options={commonOptions} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

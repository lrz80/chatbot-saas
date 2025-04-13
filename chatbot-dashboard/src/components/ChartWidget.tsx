"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

// 👇 Agregamos props para hacer el componente más flexible
interface ChartWidgetProps {
  title?: string;
  chartData?: any;
}

export default function ChartWidget({ title = "📈 Estadísticas del Chatbot", chartData }: ChartWidgetProps) {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    if (!chartData) {
      const fetchStats = async () => {
        const userId = "N8akyldBgYZqQVzN4wps5cmpYa52"; // 🔧 Ajustar si hace falta
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const monthData = docSnap.data().stats?.monthData || [];
          const labels = monthData.map((item: any) => item.mes);
          const values = monthData.map((item: any) => item.interacciones);
          setLabels(labels);
          setValues(values);
        } else {
          console.warn("No such document.");
        }
      };

      fetchStats();
    }
  }, [chartData]);

  // 🔄 Usamos props si llegan, si no usamos los datos internos
  const data = chartData || {
    labels,
    datasets: [
      {
        label: "Interacciones del Chatbot",
        data: values,
        fill: true,
        tension: 0.4,
        backgroundColor: "rgba(162, 89, 255, 0.1)",
        borderColor: "rgba(162, 89, 255, 1)",
        pointBackgroundColor: "#a259ff",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#a259ff",
          font: { weight: "bold" as const },
        },
      },
      tooltip: {
        backgroundColor: "#1f1f3b",
        titleColor: "#a259ff",
        bodyColor: "#ffffff",
        borderColor: "#a259ff",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#bbb" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#bbb", stepSize: 1 },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(162,89,255,0.2)] p-6 w-full h-full text-white">
      <h2 className="text-xl font-bold text-indigo-300 mb-4">{title}</h2>
      <Line data={data} options={options} />
    </div>
  );
}

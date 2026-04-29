import { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
} from "chart.js";

// Register required chart.js components
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
);

// ── Colour palette (matches app dark-theme) ───────────────────────
const PALETTE = [
  "rgba(99,102,241,0.85)",   // indigo
  "rgba(16,185,129,0.85)",   // emerald
  "rgba(245,158,11,0.85)",   // amber
  "rgba(239,68,68,0.85)",    // rose
  "rgba(59,130,246,0.85)",   // blue
  "rgba(168,85,247,0.85)",   // purple
  "rgba(20,184,166,0.85)",   // teal
  "rgba(249,115,22,0.85)",   // orange
  "rgba(236,72,153,0.85)",   // pink
];

const PALETTE_BORDER = PALETTE.map(c => c.replace("0.85", "1"));

// ────────────────────────────────────────────────────────────────
// 1. NGO Category Doughnut
// ────────────────────────────────────────────────────────────────
export const NGOCategoryChart = ({ labels, counts }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current || !labels?.length) return;
    if (instance.current) { instance.current.destroy(); instance.current = null; }

    instance.current = new Chart(ref.current.getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: PALETTE.slice(0, labels.length),
          borderColor: PALETTE_BORDER.slice(0, labels.length),
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#94a3b8",
              font: { size: 12, family: "'Inter', sans-serif" },
              padding: 14,
              boxWidth: 14,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => { if (instance.current) { instance.current.destroy(); instance.current = null; } };
  }, [labels, counts]); // ← Re-create chart when data changes

  return <canvas ref={ref} style={{ maxHeight: 220 }} />;
};

// ────────────────────────────────────────────────────────────────
// 2. Monthly Donation Trend Bar
// ────────────────────────────────────────────────────────────────
export const DonationTrendChart = ({ labels, counts, amounts }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current || !labels?.length) return;
    if (instance.current) { instance.current.destroy(); instance.current = null; }

    instance.current = new Chart(ref.current.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Donations",
            data: counts,
            backgroundColor: "rgba(99,102,241,0.7)",
            borderColor: "rgba(99,102,241,1)",
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#94a3b8", font: { size: 12, family: "'Inter', sans-serif" } },
          },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) =>
                amounts?.[ctx.dataIndex] > 0
                  ? `  ₹${amounts[ctx.dataIndex].toLocaleString()} collected`
                  : null,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#64748b", font: { size: 11 } },
            grid: { color: "rgba(100,116,139,0.15)" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#64748b", font: { size: 11 }, stepSize: 1, precision: 0 },
            grid: { color: "rgba(100,116,139,0.15)" },
          },
        },
      },
    });

    return () => { if (instance.current) { instance.current.destroy(); instance.current = null; } };
  }, [labels, counts, amounts]); // ← Re-create chart when data changes

  return <canvas ref={ref} style={{ maxHeight: 220 }} />;
};

// ────────────────────────────────────────────────────────────────
// 3. NGO Status Doughnut (Verified / Pending / Rejected)
// ────────────────────────────────────────────────────────────────
export const NGOStatusChart = ({ verified, pending, rejected }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) { instance.current.destroy(); instance.current = null; }

    instance.current = new Chart(ref.current.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Verified", "Pending", "Rejected"],
        datasets: [{
          data: [verified || 0, pending || 0, rejected || 0],
          backgroundColor: [
            "rgba(16,185,129,0.85)",
            "rgba(245,158,11,0.85)",
            "rgba(239,68,68,0.85)",
          ],
          borderColor: [
            "rgba(16,185,129,1)",
            "rgba(245,158,11,1)",
            "rgba(239,68,68,1)",
          ],
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#94a3b8",
              font: { size: 12, family: "'Inter', sans-serif" },
              padding: 14,
              boxWidth: 14,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                if (!total) return ` ${ctx.label}: 0`;
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => { if (instance.current) { instance.current.destroy(); instance.current = null; } };
  }, [verified, pending, rejected]); // ← Re-create chart when data changes

  return <canvas ref={ref} style={{ maxHeight: 220 }} />;
};

// ────────────────────────────────────────────────────────────────
// 4. Volunteers Per Event (NGO Dashboard) — Horizontal Bar
// ────────────────────────────────────────────────────────────────
export const VolunteersPerEventChart = ({ events, volunteersMap }) => {
  const ref = useRef(null);
  const instance = useRef(null);

  const labels = events.slice(0, 8).map(e =>
    e.title.length > 22 ? e.title.slice(0, 22) + "…" : e.title
  );
  const data = events.slice(0, 8).map(e => (volunteersMap[e._id] || []).length);

  useEffect(() => {
    if (!ref.current || !labels?.length) return;
    if (instance.current) { instance.current.destroy(); instance.current = null; }

    instance.current = new Chart(ref.current.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Volunteers",
          data,
          backgroundColor: "rgba(16,185,129,0.7)",
          borderColor: "rgba(16,185,129,1)",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: "#64748b", font: { size: 11 }, precision: 0, stepSize: 1 },
            grid: { color: "rgba(100,116,139,0.15)" },
          },
          y: {
            ticks: { color: "#94a3b8", font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });

    return () => { if (instance.current) { instance.current.destroy(); instance.current = null; } };
  }, [events, volunteersMap]); // ← Re-create chart when data changes

  return <canvas ref={ref} style={{ maxHeight: Math.max(160, labels.length * 38) }} />;
};

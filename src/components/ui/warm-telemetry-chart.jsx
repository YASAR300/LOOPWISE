"use client";

import React, { useState } from "react";

export function WarmTelemetryChart({
  data = [
    { time: "00:00", runs: 120, latency: 140 },
    { time: "04:00", runs: 85, latency: 125 },
    { time: "08:00", runs: 420, latency: 210 },
    { time: "12:00", runs: 890, latency: 280 },
    { time: "16:00", runs: 650, latency: 195 },
    { time: "20:00", runs: 340, latency: 160 },
    { time: "23:59", runs: 210, latency: 130 },
  ],
  metricKey = "runs",
  metricLabel = "Executions / hr",
  strokeColor = "#4B3FD6", // Primary indigo
  fillColor = "rgba(75, 63, 214, 0.10)",
  height = 180,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) return null;

  const values = data.map((d) => d[metricKey]);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;

  const width = 600;
  const paddingX = 40;
  const paddingY = 24;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * plotWidth;
    const y =
      paddingY +
      plotHeight -
      ((d[metricKey] - minVal) / (maxVal - minVal)) * plotHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // Catmull-Rom or cubic spline
    const prev = points[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, "");

  // Area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient
            id={`warm-grad-${metricKey}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.20" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* NO GRID: explicitly no CartesianGrid lines or dots */}

        {/* Soft 10% Area Fill */}
        <path d={areaD} fill={`url(#warm-grad-${metricKey})`} />

        {/* 2px Smooth Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Baseline Axis (Single Hairline) */}
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="currentColor"
          className="stroke-1 text-line"
        />

        {/* Points & Hover Target */}
        {points.map((pt, i) => (
          <g key={i}>
            {/* Interactive invisible hover target */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="14"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />

            {/* Active Point Halo */}
            {hoveredIndex === i && (
              <>
                <line
                  x1={pt.x}
                  y1={paddingY}
                  x2={pt.x}
                  y2={height - paddingY}
                  stroke={strokeColor}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="opacity-50"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="white"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                />
              </>
            )}
          </g>
        ))}

        {/* Muted X-Axis Labels */}
        {points.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-ink-3 font-mono text-[10px]"
          >
            {pt.data.time}
          </text>
        ))}
      </svg>

      {/* Floating Popover Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="shadow-warm pointer-events-none absolute z-20 flex -translate-x-1/2 flex-col items-center gap-0.5 rounded-lg border border-line-2 bg-[#1B1A17] px-2.5 py-1.5 text-xs text-[#F3EFE6] dark:bg-[#1C1A16]"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${Math.max(points[hoveredIndex].y - 50, 0)}px`,
          }}
        >
          <span className="font-mono text-[10px] text-ink-3">
            {points[hoveredIndex].data.time}
          </span>
          <span className="text-xs font-bold text-white">
            {points[hoveredIndex].data[metricKey].toLocaleString()}{" "}
            <span className="text-[10px] font-normal text-ink-3">
              {metricLabel}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

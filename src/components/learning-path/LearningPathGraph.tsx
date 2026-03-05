"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LearningNode,
  LearningEdge,
  LearningModule,
  LearningPathResponse,
} from "@/types";

interface LearningPathGraphProps {
  data: LearningPathResponse;
  onNodeClick?: (node: LearningNode) => void;
  selectedNodeId?: string;
}

// Difficulty color schemes
const difficultyColors = {
  beginner: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500 to-emerald-600",
    line: "#10b981",
  },
  intermediate: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/50",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
    line: "#f59e0b",
  },
  advanced: {
    bg: "bg-rose-500/20",
    border: "border-rose-500/50",
    text: "text-rose-400",
    glow: "shadow-rose-500/20",
    gradient: "from-rose-500 to-red-600",
    line: "#f43f5e",
  },
};

// Calculate automatic layout
function calculateLayout(nodes: LearningNode[], edges: LearningEdge[]) {
  // Group nodes by difficulty
  const levels = {
    beginner: nodes.filter((n) => n.difficulty === "beginner"),
    intermediate: nodes.filter((n) => n.difficulty === "intermediate"),
    advanced: nodes.filter((n) => n.difficulty === "advanced"),
  };

  const layoutNodes: LearningNode[] = [];
  const nodeWidth = 180;
  const nodeHeight = 80;
  const horizontalGap = 40;
  const verticalGap = 120;

  let yOffset = 50;

  Object.entries(levels).forEach(([difficulty, levelNodes]) => {
    if (levelNodes.length === 0) return;

    const totalWidth =
      levelNodes.length * nodeWidth + (levelNodes.length - 1) * horizontalGap;
    let xOffset = Math.max(50, (800 - totalWidth) / 2);

    levelNodes.forEach((node, index) => {
      layoutNodes.push({
        ...node,
        position: {
          x: xOffset + index * (nodeWidth + horizontalGap),
          y: yOffset,
        },
      });
    });

    yOffset += nodeHeight + verticalGap;
  });

  return layoutNodes;
}

// Edge component with curved path
function EdgeLine({
  sourceNode,
  targetNode,
  isHighlighted,
}: {
  sourceNode: LearningNode;
  targetNode: LearningNode;
  isHighlighted: boolean;
}) {
  const nodeWidth = 180;
  const nodeHeight = 60;

  const startX = sourceNode.position.x + nodeWidth / 2;
  const startY = sourceNode.position.y + nodeHeight;
  const endX = targetNode.position.x + nodeWidth / 2;
  const endY = targetNode.position.y;

  // Calculate control points for smooth curve
  const midY = (startY + endY) / 2;

  const path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

  const color = difficultyColors[targetNode.difficulty].line;

  return (
    <g>
      {/* Shadow/glow effect */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={isHighlighted ? 4 : 2}
        strokeOpacity={isHighlighted ? 0.4 : 0.15}
        filter="blur(4px)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {/* Main line */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={isHighlighted ? 3 : 2}
        strokeOpacity={isHighlighted ? 1 : 0.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {/* Animated dot */}
      {isHighlighted && (
        <motion.circle
          r={4}
          fill={color}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: `path('${path}')` }}
        />
      )}
      {/* Arrow head */}
      <motion.polygon
        points={`${endX},${endY} ${endX - 6},${endY - 10} ${endX + 6},${endY - 10}`}
        fill={color}
        fillOpacity={isHighlighted ? 1 : 0.6}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
    </g>
  );
}

// Node component
function GraphNode({
  node,
  onClick,
  isSelected,
  isInPath,
  index,
}: {
  node: LearningNode;
  onClick?: () => void;
  isSelected: boolean;
  isInPath: boolean;
  index: number;
}) {
  const colors = difficultyColors[node.difficulty];
  const isCore = node.type === "core_topic";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="absolute"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: 180,
      }}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-300
          ${colors.bg} ${colors.border}
          ${isSelected ? `ring-2 ring-offset-2 ring-offset-dark-900 ${colors.text} shadow-lg ${colors.glow}` : ""}
          ${isInPath ? "ring-1 ring-white/30" : ""}
          ${isCore ? "shadow-lg" : "shadow-md"}
          hover:shadow-xl hover:${colors.glow}
          group cursor-pointer
        `}
      >
        {/* Node type indicator */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`
              w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}
              ${isCore ? "animate-pulse" : ""}
            `}
          />
          <span className={`text-xs font-medium uppercase tracking-wider ${colors.text}`}>
            {node.difficulty}
          </span>
        </div>

        {/* Node label */}
        <h3
          className={`
            text-sm font-semibold text-white leading-tight
            group-hover:text-white transition-colors
            ${isCore ? "text-base" : ""}
          `}
        >
          {node.label}
        </h3>

        {/* Module badge */}
        {node.module && (
          <div className="mt-2">
            <span className="text-xs text-gray-400 bg-dark-700/50 px-2 py-0.5 rounded-full">
              {node.module}
            </span>
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            layoutId="selected-indicator"
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}
          />
        )}
      </motion.button>
    </motion.div>
  );
}

export default function LearningPathGraph({
  data,
  onNodeClick,
  selectedNodeId,
}: LearningPathGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Calculate layout
  const layoutNodes = useMemo(() => calculateLayout(data.nodes, data.edges), [data.nodes, data.edges]);

  // Create node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, LearningNode>();
    layoutNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [layoutNodes]);

  // Calculate container dimensions
  useEffect(() => {
    if (layoutNodes.length === 0) return;

    const maxX = Math.max(...layoutNodes.map((n) => n.position.x)) + 230;
    const maxY = Math.max(...layoutNodes.map((n) => n.position.y)) + 120;

    setDimensions({
      width: Math.max(800, maxX),
      height: Math.max(400, maxY),
    });
  }, [layoutNodes]);

  // Get nodes in the learning path for highlighting
  const pathNodeIds = useMemo(() => {
    const ids = new Set<string>();
    data.learning_path.forEach((label) => {
      const node = layoutNodes.find((n) => n.label === label);
      if (node) ids.add(node.id);
    });
    return ids;
  }, [data.learning_path, layoutNodes]);

  // Get connected edges for selected node
  const highlightedEdges = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const edges = new Set<string>();
    data.edges.forEach((edge) => {
      if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
        edges.add(`${edge.source}-${edge.target}`);
      }
    });
    return edges;
  }, [selectedNodeId, data.edges]);

  if (data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No learning path data available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto bg-dark-800/50 rounded-2xl border border-dark-700"
      style={{ minHeight: "500px" }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fff 1px, transparent 1px),
            linear-gradient(to bottom, #fff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* SVG for edges */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {data.edges.map((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          const edgeKey = `${edge.source}-${edge.target}`;
          const isHighlighted = highlightedEdges.has(edgeKey);

          return (
            <EdgeLine
              key={edgeKey}
              sourceNode={sourceNode}
              targetNode={targetNode}
              isHighlighted={isHighlighted}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      <div
        className="relative"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <AnimatePresence>
          {layoutNodes.map((node, index) => (
            <GraphNode
              key={node.id}
              node={node}
              index={index}
              onClick={() => onNodeClick?.(node)}
              isSelected={selectedNodeId === node.id}
              isInPath={pathNodeIds.has(node.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Difficulty legend */}
      <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-dark-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-dark-700">
        {Object.entries(difficultyColors).map(([level, colors]) => (
          <div key={level} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.gradient}`} />
            <span className="text-xs text-gray-400 capitalize">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

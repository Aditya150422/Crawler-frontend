"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  BookOpen,
  Target,
  Layers,
  X,
} from "lucide-react";
import { LearningNode, LearningModule, LearningPathResponse } from "@/types";

interface LearningPathPanelProps {
  data: LearningPathResponse;
  selectedNode: LearningNode | null;
  onClose?: () => void;
  onNodeSelect?: (nodeId: string) => void;
}

const difficultyConfig = {
  beginner: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "🌱",
  },
  intermediate: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "🔥",
  },
  advanced: {
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    icon: "⚡",
  },
};

export default function LearningPathPanel({
  data,
  selectedNode,
  onClose,
  onNodeSelect,
}: LearningPathPanelProps) {
  // Get prerequisites and dependents for selected node
  const getNodeConnections = (nodeId: string) => {
    const prerequisites = data.edges
      .filter((e) => e.target === nodeId)
      .map((e) => data.nodes.find((n) => n.id === e.source))
      .filter(Boolean) as LearningNode[];

    const dependents = data.edges
      .filter((e) => e.source === nodeId)
      .map((e) => data.nodes.find((n) => n.id === e.target))
      .filter(Boolean) as LearningNode[];

    return { prerequisites, dependents };
  };

  const connections = selectedNode ? getNodeConnections(selectedNode.id) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 bg-dark-800/95 backdrop-blur-xl border-l border-dark-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary-400" />
          </div>
          <h3 className="font-semibold text-white">Learning Path</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Modules Section */}
        {data.modules.length > 0 && (
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Modules</span>
            </div>
            <div className="space-y-2">
              {data.modules.map((module) => (
                <div
                  key={module.id}
                  className="p-3 rounded-lg bg-dark-700/50 border border-dark-600"
                >
                  <h4 className="font-medium text-white text-sm">{module.title}</h4>
                  {module.description && (
                    <p className="text-xs text-gray-400 mt-1">{module.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Selected Topic</span>
            </div>
            <div
              className={`p-4 rounded-xl ${difficultyConfig[selectedNode.difficulty].bg} ${difficultyConfig[selectedNode.difficulty].border} border`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{difficultyConfig[selectedNode.difficulty].icon}</span>
                <span
                  className={`text-xs font-medium uppercase tracking-wider ${difficultyConfig[selectedNode.difficulty].color}`}
                >
                  {selectedNode.difficulty}
                </span>
              </div>
              <h4 className="font-semibold text-white">{selectedNode.label}</h4>
              {selectedNode.module && (
                <p className="text-xs text-gray-400 mt-2">
                  Module: {selectedNode.module}
                </p>
              )}
            </div>

            {/* Prerequisites */}
            {connections && connections.prerequisites.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Prerequisites
                </span>
                <div className="mt-2 space-y-2">
                  {connections.prerequisites.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => onNodeSelect?.(node.id)}
                      className="w-full p-2 rounded-lg bg-dark-700/50 border border-dark-600 hover:border-dark-500 text-left transition-colors flex items-center gap-2"
                    >
                      <span className="text-sm">{difficultyConfig[node.difficulty].icon}</span>
                      <span className="text-sm text-gray-300">{node.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Leads to */}
            {connections && connections.dependents.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Leads to
                </span>
                <div className="mt-2 space-y-2">
                  {connections.dependents.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => onNodeSelect?.(node.id)}
                      className="w-full p-2 rounded-lg bg-dark-700/50 border border-dark-600 hover:border-dark-500 text-left transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      <span className="text-sm">{difficultyConfig[node.difficulty].icon}</span>
                      <span className="text-sm text-gray-300">{node.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommended Learning Path */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">
              Recommended Path
            </span>
          </div>
          <div className="space-y-1">
            {data.learning_path.map((topic, index) => {
              const node = data.nodes.find((n) => n.label === topic);
              const isSelected = selectedNode?.label === topic;

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => node && onNodeSelect?.(node.id)}
                  className={`
                    w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all
                    ${isSelected ? "bg-primary-500/20 border border-primary-500/30" : "hover:bg-dark-700/50"}
                  `}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dark-700 text-xs font-medium text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-300 truncate block">
                      {topic}
                    </span>
                    {node && (
                      <span
                        className={`text-xs ${difficultyConfig[node.difficulty].color}`}
                      >
                        {node.difficulty}
                      </span>
                    )}
                  </div>
                  {node && (
                    <span className="text-sm">
                      {difficultyConfig[node.difficulty].icon}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-dark-700 bg-dark-900/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-emerald-400">
              {data.nodes.filter((n) => n.difficulty === "beginner").length}
            </div>
            <div className="text-xs text-gray-500">Beginner</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400">
              {data.nodes.filter((n) => n.difficulty === "intermediate").length}
            </div>
            <div className="text-xs text-gray-500">Intermediate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-400">
              {data.nodes.filter((n) => n.difficulty === "advanced").length}
            </div>
            <div className="text-xs text-gray-500">Advanced</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

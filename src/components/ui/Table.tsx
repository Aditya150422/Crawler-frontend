"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={cn("bg-dark-800/50 backdrop-blur-xl border border-dark-600/50 rounded-2xl overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={cn("bg-dark-700/30 border-b border-dark-600/50", className)}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={cn("divide-y divide-dark-600/30", className)}>
      {children}
    </tbody>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick, hover = true }) => {
  return (
    <tr
      className={cn(
        "transition-colors",
        hover && "hover:bg-white/5",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className, align = "left" }) => {
  const alignments = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider",
        alignments[align],
        className
      )}
    >
      {children}
    </th>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, align = "left" }) => {
  const alignments = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={cn(
        "px-4 py-4 text-sm text-gray-300",
        alignments[align],
        className
      )}
    >
      {children}
    </td>
  );
};

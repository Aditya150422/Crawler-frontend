"use client";

import React, { useState } from "react";
import { Globe, Layers, ArrowDown } from "lucide-react";
import { Modal, Button, Input } from "@/components/ui";
import { useCollectionStore } from "@/store";
import { socketManager } from "@/lib/socket";
import toast from "react-hot-toast";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
}: CreateCollectionModalProps) {
  const { createCollection, isLoading } = useCollectionStore();
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    max_pages: 50,
    max_depth: 3,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Collection name is required";
    }
    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Please enter a valid URL";
      }
    }
    if (formData.max_pages < 0) {
      newErrors.max_pages = "Must be 0 or greater";
    }
    if (formData.max_depth < 1) {
      newErrors.max_depth = "Must be at least 1";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await createCollection({
        name: formData.name.trim(),
        url: formData.url.trim(),
        max_pages: formData.max_pages || 0,
        max_depth: formData.max_depth,
      });
      
      // Subscribe to job updates
      socketManager.joinJob(result.job_id);
      
      toast.success("Collection created! Scraping in progress...");
      handleClose();
    } catch (error) {
      toast.error((error as Error).message || "Failed to create collection");
    }
  };

  const handleClose = () => {
    setFormData({ name: "", url: "", max_pages: 50, max_depth: 3 });
    setErrors({});
    setShowAdvanced(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Collection" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Collection Name"
          placeholder="e.g., Documentation, Blog, Knowledge Base"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          leftIcon={<Layers className="w-5 h-5" />}
        />

        <Input
          label="Website URL"
          placeholder="https://example.com"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          error={errors.url}
          leftIcon={<Globe className="w-5 h-5" />}
        />

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowDown
            className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          />
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Pages
              </label>
              <input
                type="number"
                min="0"
                value={formData.max_pages}
                onChange={(e) =>
                  setFormData({ ...formData, max_pages: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="text-xs text-gray-500 mt-1">0 = unlimited</p>
              {errors.max_pages && (
                <p className="text-xs text-red-400 mt-1">{errors.max_pages}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Depth
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.max_depth}
                onChange={(e) =>
                  setFormData({ ...formData, max_depth: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="text-xs text-gray-500 mt-1">How deep to crawl</p>
              {errors.max_depth && (
                <p className="text-xs text-red-400 mt-1">{errors.max_depth}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            Create & Start Scraping
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import * as React from "react";
import { Badge } from "@havenly/ui/components/badge";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import { Plus, X, Trash2, Sparkles } from "lucide-react";

interface FeaturesManagerProps {
  initialFeatures?: string[];
  initialOtherFeatures?: Record<string, unknown> | null;
  onFeaturesChange?: (features: string[]) => void;
  onOtherFeaturesChange?: (otherFeatures: Record<string, unknown>) => void;
  tagsLabel?: string;
  customAttributesLabel?: string;
}

const COMMON_PRESETS = [
  "Balcony",
  "High-speed Wi-Fi",
  "Swimming Pool",
  "Gym",
  "24/7 Security",
  "Backup Generator",
  "Air Conditioning",
  "Fitted Kitchen",
  "Borehole Water",
  "Covered Parking",
  "Elevator",
  "CCTV",
];

export function FeaturesManager({
  initialFeatures = [],
  initialOtherFeatures = {},
  onFeaturesChange,
  onOtherFeaturesChange,
  tagsLabel = "Amenities & Feature Tags",
  customAttributesLabel = "Custom Key-Value Attributes (JSON)",
}: FeaturesManagerProps) {
  // Standard string tags
  const [tags, setTags] = React.useState<string[]>(initialFeatures);
  const [tagInput, setTagInput] = React.useState("");

  // Custom key-value pairs
  const [kvPairs, setKvPairs] = React.useState<Array<{ id: string; key: string; value: string }>>(
    () => {
      if (!initialOtherFeatures || typeof initialOtherFeatures !== "object") return [];
      return Object.entries(initialOtherFeatures).map(([k, v]) => ({
        id: Math.random().toString(36).slice(2, 9),
        key: k,
        value: String(v ?? ""),
      }));
    }
  );

  // Notify parent on tag changes
  const updateTags = (newTags: string[]) => {
    setTags(newTags);
    onFeaturesChange?.(newTags);
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      updateTags(updated);
    }
    setTagInput("");
  };

  const handleTogglePreset = (preset: string) => {
    if (tags.includes(preset)) {
      updateTags(tags.filter((t) => t !== preset));
    } else {
      updateTags([...tags, preset]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateTags(tags.filter((t) => t !== tagToRemove));
  };

  // Notify parent on KV pair changes
  const updateKvPairs = (pairs: Array<{ id: string; key: string; value: string }>) => {
    setKvPairs(pairs);
    const obj: Record<string, unknown> = {};
    for (const p of pairs) {
      const k = p.key.trim();
      if (k) {
        obj[k] = p.value.trim();
      }
    }
    onOtherFeaturesChange?.(obj);
  };

  const handleAddKvPair = () => {
    const updated = [
      ...kvPairs,
      { id: Math.random().toString(36).slice(2, 9), key: "", value: "" },
    ];
    updateKvPairs(updated);
  };

  const handleUpdateKvPair = (id: string, field: "key" | "value", val: string) => {
    const updated = kvPairs.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    updateKvPairs(updated);
  };

  const handleRemoveKvPair = (id: string) => {
    const updated = kvPairs.filter((p) => p.id !== id);
    updateKvPairs(updated);
  };

  // Compile JSON for form submission
  const currentOtherFeaturesObj = React.useMemo(() => {
    const obj: Record<string, unknown> = {};
    for (const p of kvPairs) {
      const k = p.key.trim();
      if (k) obj[k] = p.value.trim();
    }
    return obj;
  }, [kvPairs]);

  return (
    <div className="space-y-6">
      {/* Hidden inputs so plain FormData forms capture the data automatically */}
      <input type="hidden" name="featuresJson" value={JSON.stringify(tags)} />
      <input
        type="hidden"
        name="otherFeaturesJson"
        value={JSON.stringify(currentOtherFeaturesObj)}
      />

      {/* Section 1: Standard Feature Tags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{tagsLabel}</Label>
          <span className="text-muted-foreground text-xs">{tags.length} selected</span>
        </div>

        {/* Input to add custom tag */}
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Type a feature and press Enter (e.g. Ocean View, Solar Heating)..."
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleAddTag()}
            className="shrink-0"
          >
            <Plus className="mr-1 size-4" /> Add
          </Button>
        </div>

        {/* Selected Tags Chips */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="group border-border/60 bg-muted/60 flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs italic">No features selected yet.</p>
        )}

        {/* Popular Presets */}
        <div className="pt-2">
          <p className="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
            <Sparkles className="text-primary size-3" /> Popular presets (click to toggle):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_PRESETS.map((preset) => {
              const active = tags.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleTogglePreset(preset)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {active ? `✓ ${preset}` : `+ ${preset}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2: Custom Key-Value JSON Attributes */}
      <div className="border-border/60 space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">{customAttributesLabel}</Label>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Structured JSON attributes for custom specs (e.g. Floor level, Parking bays, Meter
              numbers)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddKvPair}
            className="shrink-0 text-xs"
          >
            <Plus className="mr-1 size-3.5" /> Add Attribute
          </Button>
        </div>

        {kvPairs.length > 0 ? (
          <div className="space-y-2 pt-1">
            {kvPairs.map((pair, _idx) => (
              <div key={pair.id} className="flex items-center gap-2">
                <Input
                  value={pair.key}
                  onChange={(e) => handleUpdateKvPair(pair.id, "key", e.target.value)}
                  placeholder="Key (e.g. floor_level)"
                  className="w-1/3 font-mono text-xs"
                />
                <span className="text-muted-foreground text-xs">:</span>
                <Input
                  value={pair.value}
                  onChange={(e) => handleUpdateKvPair(pair.id, "value", e.target.value)}
                  placeholder="Value (e.g. 4th Floor)"
                  className="flex-1 text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveKvPair(pair.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 shrink-0"
                  aria-label="Delete attribute"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-border/80 text-muted-foreground rounded-lg border border-dashed p-3 text-center text-xs">
            No custom JSON attributes added. Click &quot;Add Attribute&quot; to specify custom
            details.
          </div>
        )}
      </div>
    </div>
  );
}

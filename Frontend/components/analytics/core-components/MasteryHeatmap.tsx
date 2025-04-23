import React from "react";
import Image from "next/image";
import { HeatmapData } from "@/types/analytics-types";
import { MasteryCalculator } from "../MasteryCalculator";

interface MasteryHeatmapProps {
  heatmapData: HeatmapData;
  loading?: boolean;
  className?: string;
}

export function MasteryHeatmap({
  heatmapData,
  loading = false,
  className = "",
}: MasteryHeatmapProps) {
  if (loading) {
    return (
      <div
        className={`${className} bg-muted/20 rounded-md animate-pulse flex items-center justify-center`}
      >
        <p className="text-sm text-muted-foreground">Loading heatmap...</p>
      </div>
    );
  }

  if (!heatmapData || !heatmapData.image_base64) {
    // If there's no heatmap image, render a simple grid based on the data
    return (
      <div className={`${className} p-4`}>
        {heatmapData && heatmapData.heatmap_data ? (
          <div className="w-full h-full flex flex-col">
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <div></div>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${heatmapData.topic_labels?.[0]?.length || 1}, 1fr)`,
                }}
              >
                {heatmapData.topic_labels?.[0]?.map((topic, i) => (
                  <div
                    key={`topic-${i}`}
                    className="text-xs font-medium p-1 text-center truncate"
                  >
                    {topic}
                  </div>
                ))}
              </div>

              {heatmapData.subjects?.map((subject, rowIdx) => (
                <React.Fragment key={`subject-${rowIdx}`}>
                  <div className="text-xs font-medium flex items-center">
                    {subject}
                  </div>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${heatmapData.topic_labels?.[rowIdx]?.length || 1}, 1fr)`,
                    }}
                  >
                    {heatmapData.heatmap_data[rowIdx]?.map(
                      (mastery, cellIdx) => {
                        if (mastery == null) return null;

                        return (
                          <div
                            key={`cell-${rowIdx}-${cellIdx}`}
                            className="rounded-md h-12 flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: `var(--${MasteryCalculator.getMasteryColor(mastery)})`,
                              opacity: Math.max(0.2, mastery),
                            }}
                          >
                            {(mastery * 100).toFixed(0)}%
                          </div>
                        );
                      }
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            No heatmap data available
          </p>
        )}
      </div>
    );
  }

  // If there's a base64 image, render it
  return (
    <div className={`${className} relative`}>
      <Image
        src={`data:image/png;base64,${heatmapData.image_base64}`}
        alt="Topic Mastery Heatmap"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

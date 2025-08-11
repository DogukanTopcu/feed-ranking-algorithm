'use client';

import Image from 'next/image';
import Masonry from 'react-masonry-css';

interface FeedGridItem {
  image_url?: string;
  image_id?: string;
  score?: number;
  source_type?: string;
  color?: string;
}

interface FeedGridProps {
  items: FeedGridItem[];
  nCols?: number;
}

export default function FeedGrid({ items, nCols }: FeedGridProps) {
  // Dynamic breakpoint columns based on nCols parameter
  const getBreakpointColumns = (targetCols: number = 5) => {
    return {
      default: targetCols,
      1536: targetCols,
      1280: Math.min(targetCols, 4),
      1024: Math.min(targetCols, 3),
      768: Math.min(targetCols, 2),
      640: 1,
    };
  };

  const breakpointColumnsObj = getBreakpointColumns(nCols);
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No items found</p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-4"
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map((item, index) => (
        <div key={index} className="mb-4 break-inside-avoid">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-square">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={`Feed item ${index}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.score !== undefined && (
                    <span className="text-gray-600">
                      Score: {item.score ? item.score.toFixed(3) : 0}
                    </span>
                  )}
                  {item.source_type && (
                    <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                      {item.source_type}
                    </span>
                  )}
                </div>
                {item.color && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: item.color }}
                    title={item.color}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </Masonry>
  );
}
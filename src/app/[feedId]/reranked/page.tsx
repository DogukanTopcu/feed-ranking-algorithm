'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopBar from '../../../../components/TopBar';
import FeedGrid from '../../../../components/FeedGrid';

interface RerankedFeed {
  _id: string;
  user_id: string;
  feed_sample_id: string;
  ranked_feed_id: string;
  nCols: number;
  variables: {
    H_MIN: number;
    H_MAX: number;
    CLUSTER_SEQUENCE: number[];
  };
  details: {
    total_time: number;
  };
  feed_items: Array<{
    image_id: string;
    image_url?: string;
    source_type: string;
    score: number;
    is_seen?: boolean;
    metadata?: any;
    image_color?: string;
    color?: string;
  }>;
}

interface PageProps {
  params: Promise<{ feedId: string }>;
}

export default function RerankedFeedPage({ params }: PageProps) {
  const [feedId, setFeedId] = useState<string>('');
  const [rerankedFeed, setRerankedFeed] = useState<RerankedFeed | null>(null);
  const [availableNCols, setAvailableNCols] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nCols = parseInt(searchParams.get('nCols') || '5');

  useEffect(() => {
    params.then(({ feedId: id }) => {
      setFeedId(id);
      fetchRerankedFeed(id, nCols);
    });
  }, [nCols]);

  const fetchRerankedFeed = async (feedId: string, nCols: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reranked/${feedId}?nCols=${nCols}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reranked feed');
      }

      setRerankedFeed(data.rerankedFeed);
      setAvailableNCols(data.availableNCols);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNColsChange = (newNCols: number) => {
    router.push(`/${feedId}/reranked?nCols=${newNCols}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TopBar
          title={`Re-ranked Feed ${feedId.slice(-8)}`}
          subtitle="Loading re-ranked feed data..."
        />
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading re-ranked feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TopBar
        title={`Re-ranked Feed ${feedId.slice(-8)}`}
        subtitle="Clustered and re-arranged feed items for optimal visual layout"
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/${feedId}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Feed
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <Link
            href={`/${feedId}/ranked`}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Ranked View
          </Link>
          {availableNCols.length > 0 && (
            <select
              value={nCols}
              onChange={(e) => handleNColsChange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-gray-700 hover:border-gray-400 transition-colors"
            >
              {availableNCols.map((cols) => (
                <option key={cols} value={cols}>
                  {cols} Columns
                </option>
              ))}
            </select>
          )}
        </div>
      </TopBar>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {rerankedFeed && (
        <div>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Re-ranking Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Layout Columns</p>
                    <p className="text-2xl font-bold text-gray-900">{rerankedFeed.nCols}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Height Range</p>
                    <p className="text-lg font-bold text-gray-900">
                      {rerankedFeed.variables.H_MIN} - {rerankedFeed.variables.H_MAX}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Processing Time</p>
                    <p className="text-lg font-bold text-gray-900">{rerankedFeed.details.total_time}ms</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{rerankedFeed.feed_items.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {rerankedFeed.variables.CLUSTER_SEQUENCE && (
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Cluster Sequence ({rerankedFeed.variables.CLUSTER_SEQUENCE.length} clusters)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {rerankedFeed.variables.CLUSTER_SEQUENCE.map((cluster, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 rounded-full text-sm font-medium border border-teal-200"
                    >
                      <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                      Cluster {cluster}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <FeedGrid items={rerankedFeed.feed_items} nCols={rerankedFeed.nCols} />
        </div>
      )}
    </div>
  );
}
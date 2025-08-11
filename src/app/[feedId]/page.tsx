import Link from 'next/link';
import { ObjectId } from 'mongodb';
import { getFeedSamplesCollection, getImagesCollection } from '../../../lib/mongodb';
import TopBar from '../../../components/TopBar';
import FeedGrid from '../../../components/FeedGrid';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ feedId: string }>;
}

export default async function FeedDetailPage({ params }: PageProps) {
  const { feedId } = await params;
  let feedSample = null;
  let error: string | null = null;
  let feedItems: any[] = [];

  try {
    const collection = await getFeedSamplesCollection();
    feedSample = await collection.findOne({ _id: new ObjectId(feedId) });

    if (!feedSample) {
      error = 'Feed sample not found';
    } else {
      // Resolve image URLs for items that don't have image_url
      const imagesCollection = await getImagesCollection();
      const itemsWithImages = await Promise.all(
        feedSample.feed_items.map(async (item) => {
          if (!item.image_url && item.image_id) {
            try {
              const image = await imagesCollection.findOne(
                { doc_id: item.image_id },
                { projection: { images_paths: 1, color_representation: 1 } }
              );
              return {
                ...item,
                image_url: image?.images_paths?.[0] || undefined,
                color: image?.color_representation || undefined,
              };
            } catch (err) {
              console.error(`Error fetching image for ${item.image_id}:`, err);
              return item;
            }
          }
          return item;
        })
      );
      feedItems = itemsWithImages;
    }
  } catch (err) {
    error = 'Failed to fetch feed sample';
    console.error('Error fetching feed sample:', err);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TopBar title={`Feed ${feedId.slice(-8)}`}>
        <div className="flex items-center gap-3">
          <Link
            href={`/${feedId}/ranked`}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Ranked View
          </Link>
          <Link
            href={`/${feedId}/reranked?nCols=5`}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Ranked + Re-ranked View
          </Link>
        </div>
      </TopBar>

      <Link
        href="/"
        className="flex w-fit items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium my-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Feeds
      </Link>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {feedSample && (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Feed Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{feedSample.item_count}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="text-sm font-mono text-gray-900 truncate">{feedSample.user_id.slice(0, 12)}...</p>
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
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(feedSample.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Images with URLs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedItems.filter(item => item.image_url).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Type Analysis */}
            <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">Image Source Analysis</h3>
              </div>

              {(() => {
                const sourceTypeCounts = feedSample.feed_items.reduce((acc, item) => {
                  const sourceType = item.source_type || 'unknown';
                  acc[sourceType] = (acc[sourceType] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                const totalImages = Object.values(sourceTypeCounts).reduce((sum, count) => sum + count, 0);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(sourceTypeCounts).map(([sourceType, count]) => (
                      <div key={sourceType} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 capitalize">{sourceType}</p>
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {((count / totalImages) * 100).toFixed(1)}%
                            </p>
                            <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                style={{ width: `${(count / totalImages) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Total Images</p>
                        <p className="text-3xl font-bold text-gray-900">{totalImages}</p>
                        <p className="text-xs text-gray-500 mt-1">across all sources</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-blue-600 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Feed Details</h3>
                  <p className="text-sm text-blue-800">
                    This feed contains {feedSample.item_count} items from user {feedSample.user_id.slice(0, 8)}...
                    with {feedItems.filter(item => item.image_url).length} images successfully loaded.
                    Use the buttons above to view ranked or re-ranked versions of this feed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FeedGrid items={feedItems} />
        </div>
      )}
    </div>
  );
}
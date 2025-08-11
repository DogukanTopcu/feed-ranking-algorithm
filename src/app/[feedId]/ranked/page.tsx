import Link from 'next/link';
import { ObjectId } from 'mongodb';
import { getRankedFeedsCollection, getImagesCollection } from '../../../../lib/mongodb';
import TopBar from '../../../../components/TopBar';
import FeedGrid from '../../../../components/FeedGrid';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ feedId: string }>;
}

export default async function RankedFeedPage({ params }: PageProps) {
  const { feedId } = await params;
  let rankedFeed = null;
  let error: string | null = null;
  let feedItems: any[] = [];

  try {
    const collection = await getRankedFeedsCollection();
    rankedFeed = await collection
      .findOne(
        { feed_sample_id: new ObjectId(feedId) },
        { sort: { created_at: -1 } }
      );

    if (!rankedFeed) {
      error = 'Ranked feed not found';
    } else {
      // Resolve image URLs for items that don't have image_url
      const imagesCollection = await getImagesCollection();
      const itemsWithImages = await Promise.all(
        rankedFeed.feed_items.map(async (item) => {
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
    error = 'Failed to fetch ranked feed';
    console.error('Error fetching ranked feed:', err);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TopBar 
        title={`Ranked Feed ${feedId.slice(-8)}`}
        subtitle="Algorithm-ranked feed items based on scoring weights"
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
            href={`/${feedId}/reranked?nCols=5`}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Re-ranked View
          </Link>
        </div>
      </TopBar>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {rankedFeed && (
        <div>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Ranking Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Scoring Weights
                </h3>
                {rankedFeed.variables.weights && (
                  <div className="space-y-3">
                    {Object.entries(rankedFeed.variables.weights).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-700 font-medium">{key.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-blue-600">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Processing Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700 font-medium">Processing Time</span>
                    <span className="font-bold text-green-600">{rankedFeed.details.total_time.toFixed(6)} ms</span>
                  </div>
                  <div className="flex flex-col justify-between p-2 bg-gray-50 rounded">
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Personalization Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.personalization_time.toFixed(6)} ms</span>
                    </div>
                    <div className='border-b-2 border-gray-200' />
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Social Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.social_time.toFixed(6)} ms</span>
                    </div>
                    <div className='border-b-2 border-gray-200' />
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Quality Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.quality_time.toFixed(6)} ms</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-2 bg-gray-50 rounded">
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Embedding Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.embedding_time.toFixed(6)} ms</span>
                    </div>
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Tag Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.tag_time.toFixed(6)} ms</span>
                    </div>
                    <div className='border-b-2 border-gray-200' />
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Creator Following Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.creator_following_time.toFixed(6)} ms</span>
                    </div>
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Following Engagement Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.following_engagement_time.toFixed(6)} ms</span>
                    </div>
                    <div className='border-b-2 border-gray-200' />
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Popularity Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.popularity_time.toFixed(6)} ms</span>
                    </div>
                    <div className='flex items-center justify-between p-2'>
                      <span className="text-gray-700 font-medium">Aestetic Time</span>
                      <span className="font-bold text-green-600">{rankedFeed.details.aesthetic_time.toFixed(6)} ms</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700 font-medium">Items Ranked</span>
                    <span className="font-bold text-green-600">{feedItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700 font-medium">Created</span>
                    <span className="font-bold text-green-600">
                      {new Date(rankedFeed.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
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
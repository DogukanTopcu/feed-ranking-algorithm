import Link from 'next/link';
import { getFeedSamplesCollection, getUsersCollection } from '../../lib/mongodb';
import TopBar from '../../components/TopBar';
import { ObjectId } from 'mongodb';

export const revalidate = 0;

interface FeedSampleWithUser {
  _id: string;
  user_id: string;
  item_count: number;
  updated_at: Date;
  user?: {
    _id: ObjectId;
    handle?: string;
    profile?: {
      display_name: string,
      avatar_url: string,
      bio: string,
    };
  };
}

export default async function HomePage() {
  let feedSamples: FeedSampleWithUser[] = [];
  let error: string | null = null;

  try {
    const feedSamplesCollection = await getFeedSamplesCollection();
    const usersCollection = await getUsersCollection();

    // Get feed samples with user_id
    const samples = await feedSamplesCollection
      .find({}, { projection: { _id: 1, user_id: 1, item_count: 1, updated_at: 1 } })
      .sort({ updated_at: -1 })
      .limit(50)
      .toArray();

    // Get unique user IDs
    const userIds = [...new Set(samples.map(sample => new ObjectId(sample.user_id)))];

    // Fetch user information
    const users = await usersCollection
      .find({ _id: { $in: userIds } }, { projection: { _id: 1, handle: 1, profile: 1 } })
      .toArray();

      console.log(users);

    // Create user lookup map
    const userMap = new Map(users.map(user => [user._id.toString(), user]));
    console.log(userMap);

    // Combine feed samples with user data
    feedSamples = samples.map(sample => ({
      _id: sample._id.toString(),
      user_id: sample.user_id,
      item_count: sample.item_count,
      updated_at: sample.updated_at,
      user: userMap.get(sample.user_id)
    }));

    console.log(feedSamples)
  } catch (err) {
    error = 'Failed to fetch feed samples';
    console.error('Error fetching feed samples:', err);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Ranking - Reranking Algorithm Demo" />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed Samples</h1>
          <p className="text-gray-600">Browse and explore user feed samples</p>
          {feedSamples.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {feedSamples.length} feed samples
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

        {feedSamples.length === 0 && !error && (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No feed samples</h3>
            <p className="mt-1 text-sm text-gray-500">No feed samples found in the database.</p>
          </div>
        )}

        {/* Feed Samples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {feedSamples.map((sample) => (
            <Link
              key={sample._id}
              href={`/${sample._id}`}
              className="group relative block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      Feed {sample._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {sample._id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="px-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {sample.user?.handle?.[0]?.toUpperCase() ||
                          sample.user?.handle?.[0]?.toUpperCase() ||
                          sample.user?.handle?.[0]?.toUpperCase() ||
                          'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sample.user?.handle || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      User ID: {sample.user_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>{sample.item_count} items</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(sample.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
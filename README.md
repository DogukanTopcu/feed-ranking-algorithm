# MongoDB Feed Visualizer

A Next.js application that visualizes MongoDB feed data using masonry grids.

## Features

- **Home Page**: Lists the latest 50 feed samples
- **Feed Detail**: Shows original feed items with navigation to ranked/reranked views
- **Ranked View**: Displays ranked feed items with algorithm details
- **Reranked View**: Shows reranked items with column selection and cluster sequences
- **Masonry Grid**: Responsive masonry layout for optimal image display

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- MongoDB
- Tailwind CSS
- react-masonry-css

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Update `.env.local` with your MongoDB connection:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=ranking-algorithm
   ```

3. **Database Structure**:
   The app expects these MongoDB collections:
   - `feed_samples`: Original feed data
   - `ranked_feeds`: Algorithm-ranked feeds
   - `reranked_feeds`: Column-reranked feeds
   - `images`: Image metadata and paths
   - `users`: User information

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Database Schema

### Collections Used:
- **feed_samples**: `{ _id, user_id, feed_items[], item_count, updated_at }`
- **ranked_feeds**: `{ _id, user_id, feed_sample_id, feed_items[], details, variables, created_at }`
- **reranked_feeds**: `{ _id, user_id, feed_sample_id, ranked_feed_id, nCols, variables, details, feed_items[] }`
- **images**: `{ _id, doc_id, images_paths[], width, height, color_representation, ... }`

### Feed Item Structure:
```typescript
{
  image_id: string;
  image_url?: string;
  source_type: string;
  score: number;
  is_seen?: boolean;
  metadata?: any;
  image_color?: string; // Available in reranked feeds
}
```

## Routes

- `/` - Home page with feed samples list
- `/[feedId]` - Feed detail with original items
- `/[feedId]/ranked` - Ranked feed view
- `/[feedId]/reranked?nCols=5` - Reranked feed view with column selection

## Image Handling

The app supports remote images from:
- `storage.googleapis.com`
- `*.s3.amazonaws.com`
- `hubx-feed-flux-dev-gen.s3.amazonaws.com`

Images are resolved from either `image_url` directly or by joining `image_id` with the `images` collection.

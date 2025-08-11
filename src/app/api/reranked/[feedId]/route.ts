import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getRerankedFeedsCollection, getImagesCollection } from '../../../../../lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ feedId: string }> }
) {
  try {
    const { feedId } = await params;
    const { searchParams } = new URL(request.url);
    const nCols = parseInt(searchParams.get('nCols') || '5');

    const collection = await getRerankedFeedsCollection();
    
    // Get the specific reranked feed
    const rerankedFeed = await collection.findOne({
      feed_sample_id: new ObjectId(feedId),
      nCols: nCols,
    });

    // Get all available nCols for this feed
    const availableFeeds = await collection
      .find(
        { feed_sample_id: new ObjectId(feedId) },
        { projection: { nCols: 1 } }
      )
      .toArray();
    
    const availableNCols = [...new Set(availableFeeds.map(f => f.nCols))].sort((a, b) => a - b);

    if (!rerankedFeed) {
      return NextResponse.json(
        { 
          error: 'Reranked feed not found',
          availableNCols 
        },
        { status: 404 }
      );
    }

    // Resolve image URLs for items that don't have image_url
    const imagesCollection = await getImagesCollection();
    const itemsWithImages = await Promise.all(
      rerankedFeed.feed_items.map(async (item) => {
        if (!item.image_url && item.image_id) {
          try {
            const image = await imagesCollection.findOne(
              { doc_id: item.image_id },
              { projection: { images_paths: 1, color_representation: 1 } }
            );
            return {
              ...item,
              image_url: image?.images_paths?.[0] || undefined,
              color: item.image_color || image?.color_representation || undefined,
            };
          } catch (err) {
            console.error(`Error fetching image for ${item.image_id}:`, err);
            return item;
          }
        }
        return {
          ...item,
          color: item.image_color,
        };
      })
    );

    return NextResponse.json({
      rerankedFeed: {
        ...rerankedFeed,
        feed_items: itemsWithImages,
      },
      availableNCols,
    });
  } catch (error) {
    console.error('Error fetching reranked feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
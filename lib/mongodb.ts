import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ranking-algorithm';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

// Type definitions
export interface IImage {
  _id: ObjectId;
  doc_id: string;
  images_paths: string[];
  width: number;
  height: number;
  embedding: {
    model_name: string;
    dtype: string;
    embedding_size: number;
    embedding: number[];
    stats: { mean: number; std: number };
  };
  user_id: string;
  prompt_id: string;
  created_at: Date;
  color_cluster: number;
  color_representation: string;
  tags: string[];
  aesthetic_score: number;
  stats: {
    view: number;
    like: number;
    save: number;
    share: number;
    download: number;
  };
}

export interface IFeedItem {
  image_id: string;
  image_url?: string;
  source_type: string;
  score: number;
  is_seen?: boolean;
  metadata?: any;
  image_color?: string;
}

export interface IFeedSample {
  _id: ObjectId;
  user_id: string;
  feed_items: IFeedItem[];
  item_count: number;
  updated_at: Date;
}

export interface IDetails {
  total_time: number;
}

export interface IVariables {
  weights?: Record<string, number>;
  H_MIN?: number;
  H_MAX?: number;
  CLUSTER_SEQUENCE?: number[];
}

export interface IRankedFeed {
  _id: ObjectId;
  user_id: string;
  feed_sample_id: ObjectId;
  feed_items: IFeedItem[];
  details: IDetails;
  variables: IVariables;
  created_at: Date;
}

export interface IRerankedFeed {
  _id: ObjectId;
  user_id: string;
  feed_sample_id: ObjectId;
  ranked_feed_id: ObjectId;
  nCols: number;
  variables: {
    H_MIN: number;
    H_MAX: number;
    CLUSTER_SEQUENCE: number[];
  };
  details: IDetails;
  feed_items: IFeedItem[];
}

export interface IUser {
  _id: ObjectId;
  hanlde: string;
  profile: {
    display_name: string;
    avatar_url: string;
    bio: string;
  }
  created_at?: Date;
  updated_at?: Date;
}

// Collection getters
export async function getFeedSamplesCollection(): Promise<Collection<IFeedSample>> {
  const db = await getDb();
  return db.collection<IFeedSample>('feed_samples');
}

export async function getRankedFeedsCollection(): Promise<Collection<IRankedFeed>> {
  const db = await getDb();
  return db.collection<IRankedFeed>('ranked_feeds');
}

export async function getRerankedFeedsCollection(): Promise<Collection<IRerankedFeed>> {
  const db = await getDb();
  return db.collection<IRerankedFeed>('reranked_feeds');
}

export async function getImagesCollection(): Promise<Collection<IImage>> {
  const db = await getDb();
  return db.collection<IImage>('images');
}

export async function getUsersCollection(): Promise<Collection<IUser>> {
  const db = await getDb();
  return db.collection<IUser>('users');
}

export default clientPromise;
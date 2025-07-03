import { getPosts, getPostBySlug, PostAttributes } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import styles from './SinglePostPage.module.css'; // Create this CSS module

interface StrapiDataItem<T> {
  id: number;
  attributes: T;
}

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Removed populate: '*'
  const postResponse = await getPostBySlug(params.slug);
  if (!postResponse || !postResponse.data) {
    return { title: 'Post Not Found' };
  }
  const post = postResponse.data.attributes;
  return {
    title: post.title,
    description: post.excerpt || post.contentBody?.substring(0, 150) || 'Read this exciting post.',
  };
}

export async function generateStaticParams() {
  try {
    const postsResponse = await getPosts({ fields: ['slug'] });
    if (!postsResponse || !postsResponse.data) return [];
    return postsResponse.data.map((post) => ({ slug: post.attributes.slug }));
  } catch (error) {
    console.error("Failed to generate static params for posts:", error);
    return [];
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = params;

  try {
    const postResponse = await getPostBySlug(slug, { populate: '*' });

    if (!postResponse || !postResponse.data) {
      notFound();
    }

    const postData: StrapiDataItem<PostAttributes> = postResponse.data;
    const post = postData.attributes;

    return (
      <article className={styles.postArticle}>
        <h1>{post.title}</h1>
        <p className={styles.postDate}>
          Published on: {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
        </p>
        {post.excerpt && (
          <p className={styles.postExcerpt}>{post.excerpt}</p>
        )}
        <div
          className={`strapi-richtext ${styles.postContent}`} // Apply global richtext styles and module specific if any
          dangerouslySetInnerHTML={{ __html: post.contentBody || "" }}
        />
        <div className={styles.backLinkContainer}>
          <Link href="/posts" className="button-link">&larr; Back to Posts</Link>
        </div>
      </article>
    );
  } catch (error) {
    console.error(`Failed to fetch post with slug ${slug}:`, error);
    if (error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound();
    }
     return <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>Error loading post. It might not exist or there was a server issue.</p>;
  }
}

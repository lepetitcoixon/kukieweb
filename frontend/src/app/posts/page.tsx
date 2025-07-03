import Link from 'next/link';
import { getPosts, PostAttributes } from '@/lib/api';
import { Metadata } from 'next';
import styles from './PostsPage.module.css'; // Create this CSS module

export const metadata: Metadata = {
  title: 'Blog Posts',
  description: 'Read our latest blog posts.',
};

interface StrapiDataItem<T> {
  id: number;
  attributes: T;
}

export default async function PostsPage() {
  try {
    // Removed populate: '*' as current attributes are top-level.
    // Add specific population if relations/media are added later.
    const postsResponse = await getPosts({ sort: 'publishedAt:desc' });
    const posts: StrapiDataItem<PostAttributes>[] = postsResponse.data;

    if (!posts || posts.length === 0) {
      return <p>No posts found. Check back later!</p>;
    }

    return (
      <div className={styles.postsPageContainer}>
        <h1>Blog Posts</h1>
        <p>Here are our latest articles.</p>
        <ul className={styles.postsList}>
          {posts.map((post) => (
            <li key={post.id} className={styles.postItem}>
              <h2>
                <Link href={`/posts/${post.attributes.slug}`} className={styles.postTitleLink}>
                  {post.attributes.title}
                </Link>
              </h2>
              {post.attributes.excerpt && (
                <p className={styles.postExcerpt}>{post.attributes.excerpt}</p>
              )}
              <small className={styles.postDate}>
                Published on: {new Date(post.attributes.publishedAt || post.attributes.createdAt).toLocaleDateString()}
              </small>
              <div>
                <Link href={`/posts/${post.attributes.slug}`} className="button-link" style={{marginTop: '0.5rem'}}>
                  Read more &rarr;
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    let errorMessage = "Failed to load posts. Please try again later.";
    if (error instanceof Error) {
        // Error handling logic can be expanded
    }
    return <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{errorMessage}</p>;
  }
}

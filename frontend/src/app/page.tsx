import Link from 'next/link';
import { getPosts, PostAttributes } from '@/lib/api';
import styles from './page.module.css'; // Reusing and simplifying this file
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to My Awesome Site',
  description: 'The homepage of my awesome site built with Next.js and Strapi.',
};

interface StrapiDataItem<T> {
  id: number;
  attributes: T;
}

async function getRecentPosts(limit: number = 3) {
  try {
    // Removed populate: '*'
    const response = await getPosts({
      sort: 'publishedAt:desc',
      pagination: { pageSize: limit, page: 1 },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch recent posts for homepage:", error);
    return [];
  }
}

export default async function Home() {
  const recentPosts: StrapiDataItem<PostAttributes>[] = await getRecentPosts(3);

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <h1>Welcome to My Awesome Site!</h1>
        <p className={styles.subtitle}>
          Discover interesting articles, tutorials, and more. Built with Next.js and Strapi.
        </p>
        <Link href="/posts" className="button-link">
          Explore All Posts
        </Link>
      </section>

      {recentPosts && recentPosts.length > 0 && (
        <section className={styles.recentPostsSection}>
          <h2>Recent Posts</h2>
          <ul className={styles.postsList}>
            {recentPosts.map((post) => (
              <li key={post.id} className={styles.postItem}>
                <h3>
                  <Link href={`/posts/${post.attributes.slug}`} className={styles.postTitleLink}>
                    {post.attributes.title}
                  </Link>
                </h3>
                {post.attributes.excerpt && (
                  <p className={styles.postExcerpt}>{post.attributes.excerpt}</p>
                )}
                <small className={styles.postDate}>
                  Published on: {new Date(post.attributes.publishedAt || post.attributes.createdAt).toLocaleDateString()}
                </small>
                <div>
                  <Link href={`/posts/${post.attributes.slug}`} className={styles.readMoreLink}>
                    Read more &rarr;
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

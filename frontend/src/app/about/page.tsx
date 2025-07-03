import { Metadata } from 'next';
import styles from './AboutPage.module.css'; // We'll create this CSS module

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about My Awesome Site and our mission.',
};

export default function AboutPage() {
  // In a future step, this content could be fetched from Strapi's "Page" content type
  // const pageData = await getPageBySlug('about-us');
  // const { title, contentBody } = pageData.data.attributes;

  return (
    <div className={styles.aboutContainer}>
      <h1>About Us</h1> {/* Or use: {title} if fetched */}

      <section className={styles.section}>
        <h2>Our Mission</h2>
        <p>
          Welcome to My Awesome Site! Our mission is to provide high-quality content
          that informs, entertains, and inspires our readers. We believe in the power
          of sharing knowledge and stories to build a better, more connected world.
        </p>
        <p>
          This platform is a space for exploration, learning, and discovery. Whether
          you're here for our insightful articles, helpful tutorials, or just to
          explore new ideas, we're glad to have you.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Our Story</h2>
        <p>
          My Awesome Site was founded in [Year] with a simple idea: to create a
          place where curiosity is celebrated. What started as a small project has
          grown into a vibrant community of readers and contributors.
        </p>
        <p>
          We are passionate about [mention key topics or values, e.g., technology, creativity, lifelong learning]
          and strive to bring you fresh perspectives and reliable information.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Meet the Team (Placeholder)</h2>
        <p>
          Our dedicated team works tirelessly to bring you the best content.
          (This section would ideally showcase team members, perhaps fetched from Strapi).
        </p>
        {/* Example of how team members could be listed:
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <h3>Team Member 1</h3>
            <p>Role/Short Bio</p>
          </div>
          <div className={styles.teamMember}>
            <h3>Team Member 2</h3>
            <p>Role/Short Bio</p>
          </div>
        </div>
        */}
      </section>

      <section className={styles.section}>
        <h2>Contact Us</h2>
        <p>
          Have questions or want to get in touch? We'd love to hear from you!
          Please reach out to us at [email protected] or follow us on our social media channels.
        </p>
      </section>
    </div>
  );
}

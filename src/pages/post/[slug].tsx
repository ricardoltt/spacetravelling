import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    const headingTime = contentItem.heading.split(/\s+/).length;
    const wordsTime = RichText.asText(contentItem.body).split(/\s+/).length;

    return total + headingTime + wordsTime;
  }, 0);
  const readTime = Math.ceil(totalWords / 200);

  const formattedDate = format(
    new Date(post.first_publication_date),
    'd MMM u',
    {
      locale: ptBR,
    }
  );

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />
      <img
        src={post.data.banner.url}
        alt="imagebanner"
        className={styles.banner}
      />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
            <div className={styles.postAditionalInfo}>
              <FiCalendar className={styles.icons} />
              <time> {formattedDate}</time>
              <FiUser className={styles.icons} />
              <p>{post.data.author}</p>
              <FiClock className={styles.icons} />
              <p>{`${readTime} min`}</p>
            </div>
          </div>

          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));
  console.log({ response: response.data.content });

  return {
    props: {
      post: response,
    },
    revalidate: 18000,
  };
};

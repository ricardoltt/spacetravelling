import { GetStaticProps } from 'next';

import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { useState } from 'react';
import { Head } from 'next/document';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [results, setResults] = useState<Post[]>(
    postsPagination.results.map(result => {
      return {
        ...result,
        first_publication_date: format(
          new Date(result.first_publication_date),
          'd MMM u',
          {
            locale: ptBR,
          }
        ),
      };
    })
  );

  function handleNextPage(): void {
    fetch(nextPage).then(response => {
      response.json().then(responsePrismic => {
        setNextPage(responsePrismic.next_page);

        const posts = responsePrismic.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'd MMM u',
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setResults([...results, ...posts]);
      });
    });
  }

  return (
    <>
      <div className={commonStyles.container}>
        <img src="/images/logo.svg" alt="logo" />
        <section className={styles.post}>
          {results.map(post => (
            <main>
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h1>{post.data.title}</h1>
                </a>
              </Link>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <div className={styles.postAditionalInfo}>
                <AiOutlineCalendar className={styles.icons} />
                <time>{post.first_publication_date}</time>
                <AiOutlineUser className={styles.icons} />
                <p>{post.data.author}</p>
              </div>
            </main>
          ))}
          {nextPage ? (
            <button
              className={styles.loadMorePostsButton}
              type="button"
              onClick={handleNextPage}
            >
              Carregar mais posts
            </button>
          ) : (
            ''
          )}
        </section>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });

  const posts = postsResponse.results.map(postData => {
    const first_publication_date = format(
      new Date(postData.first_publication_date),
      'd MMM u',
      { locale: ptBR }
    );

    return {
      uid: postData.uid,
      first_publication_date,
      data: {
        title: postData.data.title,
        subtitle: postData.data.subtitle,
        author: postData.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: { posts, postsPagination },
  };
};

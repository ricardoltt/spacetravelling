import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <Link href="/">
            <a>
              <img src="/images/logo.svg" alt="logo" />
            </a>
          </Link>
        </div>
      </header>
    </>
  );
}

import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';

export default function NotFoundContent({className}) {
  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className="row">
        <div className="col col--8 col--offset-2">
          <Heading as="h1" className="hero__title">
            Contenu non disponible
          </Heading>
          <p>
            Le matériel que vous cherchez n'existe pas ou <strong>n'a pas encore été publié</strong>.
          </p>
          <p>
            Si vous cherchez l'énoncé d'un travail pratique ou les notes d'une leçon future, il est tout à fait normal que cette page soit inaccessible pour le moment. Le contenu sera dévoilé au moment prévu dans le plan de cours.
          </p>
          <div className="margin-top--lg">
            <Link className="button button--primary button--lg" to="/">
              Retourner à l'accueil du cours
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
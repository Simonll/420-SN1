import React from 'react';
import type { ReactNode } from 'react';
import { FeedbackProvider } from '../components/Feedback/FeedbackContext';

/**
 * Composant racine Docusaurus (swizzle de @theme/Root).
 * Injecte la configuration globale du composant Feedback dans tout l'arbre.
 *
 * Les <Feedback /> du site héritent de ces valeurs sauf si une prop
 * est explicitement passée au composant ou surchargeée par un <FeedbackProvider>
 * imbriqué plus bas dans l'arbre.
 */
export default function Root({ children }: { children: ReactNode }): JSX.Element {
  return (
    <FeedbackProvider
      config={{
        question:    'Les explications de cette section étaient-elles claires ?',
        minLabel:    '1 = Pas du tout clair',
        maxLabel:    '5 = Très clair',
        ratingFeedback: {
          1: "Désolé d'apprendre ça — ton commentaire nous aidera.",
          2: "On peut faire mieux. Dis-nous ce qui coince.",
          3: "Correct. Quelques précisions à ajouter ?",
          4: "Merci ! Une petite amélioration en tête ?",
          5: "Excellent — merci pour ta lecture attentive !",
        },
        allowComment: true,
        submitUrl:
          'https://momgiqoavbjtpvgsjboe.supabase.co/functions/v1/collect-feedback',
      }}
    >
      {children}
    </FeedbackProvider>
  );
}

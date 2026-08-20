import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// ── Interface de configuration ─────────────────────────────────────────────────

export interface FeedbackConfig {
  /** Question affichée au-dessus des étoiles */
  question?: string;
  /** Libellé décrivant la valeur minimale (étoile 1) */
  minLabel?: string;
  /** Libellé décrivant la valeur maximale (étoile 5) */
  maxLabel?: string;
  /** Message contextuel affiché pour chaque note (1 à 5) */
  ratingFeedback?: Record<number, string>;
  /** Autoriser l'ajout d'un commentaire optionnel après soumission */
  allowComment?: boolean;
  /** URL du endpoint qui reçoit les rétroactions */
  submitUrl?: string;
}

// ── Valeurs par défaut (configuration actuelle du site) ───────────────────────

export const DEFAULT_CONFIG: Required<FeedbackConfig> = {
  question: 'Les explications de cette section étaient-elles claires ?',
  minLabel: '1 = Pas du tout clair',
  maxLabel: '5 = Très clair',
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
};

// ── Contexte React ─────────────────────────────────────────────────────────────

const FeedbackContext = createContext<FeedbackConfig>({});

// ── Provider ───────────────────────────────────────────────────────────────────

interface FeedbackProviderProps {
  config?: FeedbackConfig;
  children: ReactNode;
}

/**
 * Fournit une configuration partagée à tous les composants <Feedback /> de
 * l'arbre. Placez-le le plus haut possible (ex. : src/theme/Root.tsx).
 *
 * @example
 * <FeedbackProvider config={{ allowComment: false }}>
 *   <App />
 * </FeedbackProvider>
 */
export function FeedbackProvider({
  config = {},
  children,
}: FeedbackProviderProps): JSX.Element {
  return (
    <FeedbackContext.Provider value={config}>
      {children}
    </FeedbackContext.Provider>
  );
}

// ── Hook de résolution (props > contexte > défaut) ────────────────────────────

/**
 * Résout la configuration effective d'un composant <Feedback />.
 * Priorité : props du composant → valeurs du FeedbackProvider → DEFAULT_CONFIG.
 */
export function useFeedbackConfig(
  props: FeedbackConfig = {},
): Required<FeedbackConfig> {
  const ctx = useContext(FeedbackContext);

  return {
    question:       props.question       ?? ctx.question       ?? DEFAULT_CONFIG.question,
    minLabel:       props.minLabel       ?? ctx.minLabel       ?? DEFAULT_CONFIG.minLabel,
    maxLabel:       props.maxLabel       ?? ctx.maxLabel       ?? DEFAULT_CONFIG.maxLabel,
    ratingFeedback: props.ratingFeedback ?? ctx.ratingFeedback ?? DEFAULT_CONFIG.ratingFeedback,
    allowComment:   props.allowComment   ?? ctx.allowComment   ?? DEFAULT_CONFIG.allowComment,
    submitUrl:      props.submitUrl      ?? ctx.submitUrl      ?? DEFAULT_CONFIG.submitUrl,
  };
}

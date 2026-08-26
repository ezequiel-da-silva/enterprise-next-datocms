import type { AppLocale } from "@/constants/i18n";
import {
  isUserReviewErrorCode,
  type UserReviewErrorCode,
  type UserReviewStatusCode,
} from "@/core/entities/user-review";

/**
 * Copy do bloco Reviews Section (secção, cards e formulário) por locale.
 * Módulo puro: o formulário é cliente e a Server Action é servidor — ambos importam daqui.
 */
export type ReviewsCopy = {
  /** Fallback do `aria-label` da secção quando o CMS não tem título. */
  sectionLabel: string;
  anonymous: string;
  starsLabel: (rating: number) => string;
  aggregateLabel: (average: string, count: number) => string;
  form: {
    heading: string;
    intro: string;
    name: string;
    email: string;
    rating: string;
    ratingHint: string;
    ratingOption: (value: number) => string;
    comment: string;
    submit: string;
    submitting: string;
    honeypot: string;
  };
  errors: Record<UserReviewErrorCode, string>;
  status: Record<UserReviewStatusCode, string>;
};

export const REVIEWS_COPY: Record<AppLocale, ReviewsCopy> = {
  en: {
    sectionLabel: "Reviews",
    anonymous: "Anonymous",
    starsLabel: (rating) => `${rating} out of 5 stars`,
    aggregateLabel: (average, count) =>
      `${average} out of 5 · ${count} ${count === 1 ? "review" : "reviews"}`,
    form: {
      heading: "Leave your review",
      intro: "Your review will be published after moderation.",
      name: "Name",
      email: "Email",
      rating: "Rating",
      ratingHint: "Pick from 1 to 5 stars. The rating starts at 5 stars.",
      ratingOption: (value) => `${value} ${value === 1 ? "star" : "stars"}`,
      comment: "Comment",
      submit: "Submit review",
      submitting: "Sending…",
      honeypot: "Do not fill in this field",
    },
    errors: {
      "authorName.min": "Enter your name with at least 2 characters.",
      "authorName.max": "The name must be at most 100 characters.",
      "authorEmail.required": "Enter your email.",
      "authorEmail.invalid": "Enter a valid email address.",
      "authorEmail.max": "The email must be at most 254 characters.",
      "comment.min": "The comment must be at least 10 characters.",
      "comment.max": "The comment must be at most 1000 characters.",
      "rating.int": "The rating must be a whole number.",
      "rating.range": "Choose a rating from 1 to 5.",
    },
    status: {
      submitted: "We received your review. It will be published after moderation.",
      rateLimited: "Too many attempts. Wait a minute and try again.",
      notConfigured: "Review submissions are temporarily unavailable. Try again later.",
      transportError: "We couldn't send your review. Try again later.",
    },
  },
  pt: {
    sectionLabel: "Avaliações",
    anonymous: "Anônimo",
    starsLabel: (rating) => `${rating} de 5 estrelas`,
    aggregateLabel: (average, count) =>
      `${average} de 5 · ${count} ${count === 1 ? "avaliação" : "avaliações"}`,
    form: {
      heading: "Deixe sua avaliação",
      intro: "Seu depoimento será publicado após moderação.",
      name: "Nome",
      email: "E-mail",
      rating: "Avaliação",
      ratingHint: "Selecione de 1 a 5 estrelas. A avaliação começa com 5 estrelas.",
      ratingOption: (value) => `${value} ${value === 1 ? "estrela" : "estrelas"}`,
      comment: "Comentário",
      submit: "Enviar avaliação",
      submitting: "Enviando…",
      honeypot: "Não preencha este campo",
    },
    errors: {
      "authorName.min": "Informe seu nome com pelo menos 2 caracteres.",
      "authorName.max": "O nome deve ter no máximo 100 caracteres.",
      "authorEmail.required": "Informe seu e-mail.",
      "authorEmail.invalid": "Informe um e-mail válido.",
      "authorEmail.max": "O e-mail deve ter no máximo 254 caracteres.",
      "comment.min": "O comentário deve ter pelo menos 10 caracteres.",
      "comment.max": "O comentário deve ter no máximo 1000 caracteres.",
      "rating.int": "A avaliação deve ser um número inteiro.",
      "rating.range": "Escolha uma avaliação de 1 a 5.",
    },
    status: {
      submitted: "Recebemos seu depoimento. Ele será publicado após moderação.",
      rateLimited: "Muitas tentativas. Aguarde um minuto e tente novamente.",
      notConfigured: "Envio de avaliações temporariamente indisponível. Tente mais tarde.",
      transportError: "Não foi possível enviar a avaliação. Tente novamente mais tarde.",
    },
  },
  es: {
    sectionLabel: "Reseñas",
    anonymous: "Anónimo",
    starsLabel: (rating) => `${rating} de 5 estrellas`,
    aggregateLabel: (average, count) =>
      `${average} de 5 · ${count} ${count === 1 ? "reseña" : "reseñas"}`,
    form: {
      heading: "Deja tu reseña",
      intro: "Tu reseña se publicará tras la moderación.",
      name: "Nombre",
      email: "Correo electrónico",
      rating: "Valoración",
      ratingHint: "Elige de 1 a 5 estrellas. La valoración empieza con 5 estrellas.",
      ratingOption: (value) => `${value} ${value === 1 ? "estrella" : "estrellas"}`,
      comment: "Comentario",
      submit: "Enviar reseña",
      submitting: "Enviando…",
      honeypot: "No rellenes este campo",
    },
    errors: {
      "authorName.min": "Escribe tu nombre con al menos 2 caracteres.",
      "authorName.max": "El nombre debe tener como máximo 100 caracteres.",
      "authorEmail.required": "Escribe tu correo electrónico.",
      "authorEmail.invalid": "Escribe un correo electrónico válido.",
      "authorEmail.max": "El correo electrónico debe tener como máximo 254 caracteres.",
      "comment.min": "El comentario debe tener al menos 10 caracteres.",
      "comment.max": "El comentario debe tener como máximo 1000 caracteres.",
      "rating.int": "La valoración debe ser un número entero.",
      "rating.range": "Elige una valoración de 1 a 5.",
    },
    status: {
      submitted: "Hemos recibido tu reseña. Se publicará tras la moderación.",
      rateLimited: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
      notConfigured: "El envío de reseñas no está disponible temporalmente. Inténtalo más tarde.",
      transportError: "No se pudo enviar la reseña. Inténtalo de nuevo más tarde.",
    },
  },
};

export function reviewsCopy(locale: AppLocale): ReviewsCopy {
  return REVIEWS_COPY[locale];
}

/** Traduz o código vindo do core; texto desconhecido passa como está (nunca esconder um erro). */
export function translateReviewFieldError(
  code: string | undefined,
  locale: AppLocale,
): string | undefined {
  if (!code) return undefined;
  return isUserReviewErrorCode(code) ? REVIEWS_COPY[locale].errors[code] : code;
}

const NUMBER_LOCALE: Record<AppLocale, string> = {
  en: "en-US",
  pt: "pt-BR",
  es: "es-ES",
};

/** Uma casa decimal — o mesmo valor tem de aparecer na página e no `aggregateRating`. */
export function formatRatingAverage(average: number, locale: AppLocale): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average);
}

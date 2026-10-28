import { TranslationMessages } from './validation-translation';

export type ValidationMessages = {
  [K in keyof typeof TranslationMessages]: Omit<
    Parameters<(typeof TranslationMessages)[K]>[0],
    'ExternalLink'
  >;
};

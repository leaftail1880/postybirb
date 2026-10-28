import type {
  TranslationMessages,
  ValidationMessages,
} from '@postybirb/translations';
import {
  IWebsiteFormFields,
  SimpleValidationResult,
  ValidationMessage,
} from '@postybirb/types';

type KeysToOmit =
  | 'mergeDefaults'
  | 'getFormFieldFor'
  | 'getFormFields'
  | 'getProcessedTags';

type ValidationArray<Fields extends IWebsiteFormFields> =
  ValidationMessage<Fields>[];

export class SubmissionValidator<Fields extends IWebsiteFormFields = never> {
  protected readonly warnings: ValidationArray<Fields> = [];

  protected readonly errors: ValidationArray<Fields> = [];

  /**
   * Adds error to the validation result
   *
   * @param id - Error localization message id. {@link TranslationMessages}
   * @param values - Values to fill in the message
   * @param field - Associates the error to a input field
   */
  error<T extends keyof ValidationMessages>(
    id: T,
    values: ValidationMessages[T] extends undefined
      ? Record<string, never>
      : ValidationMessages[T],
    field?: keyof Omit<Fields, KeysToOmit>,
  ) {
    this.errors.push({ id, values, field });
  }

  /**
   * Adds warning to the validation result
   *
   * @param id - Warning localization message id. {@link TranslationMessages}
   * @param values - Values to fill in the message
   * @param field - Associates the warning to a input field
   */
  warning<T extends keyof ValidationMessages>(
    id: T,
    values: ValidationMessages[T] extends undefined
      ? Record<string, never>
      : ValidationMessages[T],
    field?: keyof Omit<Fields, KeysToOmit>,
  ) {
    this.warnings.push({ id, values, field });
  }

  /**
   * Returns validation result. Should be used in the onValidateFileSubmission or onValidateMessageSubmission
   */
  get result(): SimpleValidationResult<Fields> {
    return { errors: this.errors, warnings: this.warnings };
  }
}

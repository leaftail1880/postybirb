import { IEntityDto } from '../../dtos';
import { IAccount } from '../account/account.interface';
import { EntityId } from '../database/entity.interface';
import { IWebsiteFormFields } from './website-form-fields.interface';

export type SimpleValidationResult<T extends IWebsiteFormFields = never> = Omit<
  ValidationResult<T>,
  'id' | 'account'
>;

export type ValidationResult<T extends IWebsiteFormFields = never> = {
  /**
   * Id that associates with the website options the validation was performed on.
   */
  id: EntityId;

  /**
   * The account associated with the website options.
   * More for readability and to avoid having to look up the account from the website options.
   */
  account: IEntityDto<IAccount>;

  /**
   * Non-blocking issues with the validated submission.
   */
  warnings: ValidationMessage<T>[];

  /**
   * Blocking issues with the validated submission.
   */
  errors: ValidationMessage<T>[];
};

export type ValidationMessage<
  T extends object = never
> = {
  /**
   * Localization message id.
   */
  id: string;

  /**
   * Associates the message to a input field.
   */
  field?: keyof T;

  /**
   * Values to fill in the message.
   */
  values: Record<string, unknown>;
};


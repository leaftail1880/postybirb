import {
  FileSubmission,
  ImageResizeProps,
  ISubmissionFile,
  IWebsiteFormFields,
  PostData,
  PostResponse,
  SimpleValidationResult,
} from '@postybirb/types';
import { Class } from 'type-fest';
import { CancellableToken } from '../../../post/models/cancellable-token';
import { PostingFile } from '../../../post/models/posting-file';
import { UnknownWebsite } from '../../website';

export const FileWebsiteKey = 'FileModel';

/**
 * Defines methods for allowing file based posting.
 * Generally this will always be used by each supported website.
 * @interface FileWebsite
 */
export interface FileWebsite<T extends IWebsiteFormFields> {
  FileModel: Class<T>;

  createFileModel(): T;

  calculateImageResize(file: ISubmissionFile): ImageResizeProps | undefined;

  onPostFileSubmission(
    postData: PostData<FileSubmission, T>,
    files: PostingFile[],
    cancellationToken: CancellableToken,
  ): Promise<PostResponse>;

  onValidateFileSubmission(
    postData: PostData<FileSubmission, T>,
  ): Promise<SimpleValidationResult>;
}

export function isFileWebsite(
  websiteInstance: UnknownWebsite,
): websiteInstance is FileWebsite<IWebsiteFormFields> & UnknownWebsite {
  return Boolean(
    (websiteInstance as FileWebsite<IWebsiteFormFields> & UnknownWebsite)
      .supportsFile,
  );
}

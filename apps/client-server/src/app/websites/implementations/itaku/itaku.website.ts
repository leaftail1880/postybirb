import { SelectOption } from '@postybirb/form-builder';
import { Http } from '@postybirb/http';
import {
  FileSubmissionMetadata,
  FileType,
  ILoginState,
  ImageResizeProps,
  PostData,
  PostResponse,
  SimpleValidationResult,
  SubmissionRating,
} from '@postybirb/types';
import { BrowserWindowUtils } from '@postybirb/utils/electron';
import { CancellableToken } from '../../../post/models/cancellable-token';
import { PostingFile } from '../../../post/models/posting-file';
import FileSize from '../../../utils/filesize.util';
import { PostBuilder } from '../../commons/post-builder';
import { validatorPassthru } from '../../commons/validator-passthru';
import { UserLoginFlow } from '../../decorators/login-flow.decorator';
import { SupportsFiles } from '../../decorators/supports-files.decorator';
import { SupportsUsernameShortcut } from '../../decorators/supports-username-shortcut.decorator';
import { WebsiteMetadata } from '../../decorators/website-metadata.decorator';
import { DataPropertyAccessibility } from '../../models/data-property-accessibility';
import { FileWebsite } from '../../models/website-modifiers/file-website';
import { MessageWebsite } from '../../models/website-modifiers/message-website';
import { Website } from '../../website';
import { ItakuAccountData } from './models/itaku-account-data';
import { ItakuFileSubmission } from './models/itaku-file-submission';
import { ItakuMessageSubmission } from './models/itaku-message-submission';
import { ItakuUserInfo } from './models/itaku-user-info';

type ItakuSessionData = {
  token: string;
  profile: ItakuUserInfo['profile'];
};

@WebsiteMetadata({
  name: 'itaku',
  displayName: 'Itaku',
})
@UserLoginFlow('https://itaku.ee')
@SupportsFiles({
  acceptedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/mov',
  ],
  acceptedFileSizes: {
    [FileType.IMAGE]: FileSize.megabytes(10),
    [FileType.VIDEO]: FileSize.megabytes(500),
  },
  fileBatchSize: 100,
})
@SupportsUsernameShortcut({
  id: 'itaku',
  url: 'https://itaku.ee/profile/$1',
})
export default class Itaku
  extends Website<ItakuAccountData, ItakuSessionData>
  implements
    FileWebsite<ItakuFileSubmission>,
    MessageWebsite<ItakuMessageSubmission>
{
  protected BASE_URL = 'https://itaku.ee';

  public externallyAccessibleWebsiteDataProperties: DataPropertyAccessibility<ItakuAccountData> =
    {
      galleryFolders: true,
      notificationFolders: true,
    };

  public async onLogin(): Promise<ILoginState> {
    const localStorage = await BrowserWindowUtils.getLocalStorage<{
      token: string;
    }>(this.accountId, this.BASE_URL);

    if (localStorage.token) {
      this.sessionData.token = localStorage.token.replace(/"/g, '');
      const user = await Http.get<ItakuUserInfo>(
        `${this.BASE_URL}/api/auth/user/`,
        {
          partition: this.accountId,
          headers: {
            Authorization: `Token ${this.sessionData.token}`,
          },
        },
      );

      this.loginState.setLogin(true, user.body.profile.displayname);
      this.sessionData.profile = user.body.profile;
      await this.retrieveFolders();
    } else {
      this.loginState.logout();
    }

    return this.loginState;
  }

  private async retrieveFolders(): Promise<void> {
    try {
      const notificationFolderRes = await Http.get<
        { id: string; num_images: number; title: string }[]
      >(
        `${this.BASE_URL}/api/post_folders/?owner=${this.sessionData.profile.owner}`,
        {
          partition: this.accountId,
          headers: {
            Authorization: `Token ${this.sessionData.token}`,
          },
        },
      );

      const notificationFolders: SelectOption[] =
        notificationFolderRes.body.map((f) => ({
          value: f.title,
          label: f.title,
        }));

      const galleryFolderRes = await Http.get<{
        count: number;
        links: object;
        results: {
          group: string;
          id: number;
          num_images: number;
          title: string;
        }[];
      }>(
        `${this.BASE_URL}/api/galleries/?owner=${this.sessionData.profile.owner}&page_size=300`,
        {
          partition: this.accountId,
          headers: {
            Authorization: `Token ${this.sessionData.token}`,
          },
        },
      );

      const galleryFolders: SelectOption[] = galleryFolderRes.body.results.map(
        (f) => ({
          value: f.title,
          label: f.title,
        }),
      );

      await this.setWebsiteData({
        notificationFolders,
        galleryFolders,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve folders', error);
    }
  }

  private convertRating(rating: SubmissionRating): string {
    switch (rating) {
      case SubmissionRating.MATURE:
        return 'Questionable';
      case SubmissionRating.ADULT:
      case SubmissionRating.EXTREME:
        return 'NSFW';
      case SubmissionRating.GENERAL:
      default:
        return 'SFW';
    }
  }

  createFileModel(): ItakuFileSubmission {
    return new ItakuFileSubmission();
  }

  calculateImageResize(): ImageResizeProps {
    return undefined;
  }

  private async uploadFile(
    postData: PostData<ItakuFileSubmission>,
    file: PostingFile,
    isBatch: boolean,
    cancellationToken: CancellableToken,
  ): Promise<{ id: number }> {
    const spoilerText =
      postData.options.contentWarning || file.metadata.spoilerText;

    if (
      !(file.fileType === FileType.IMAGE || file.fileType === FileType.VIDEO)
    ) {
      throw new Error('Unsupported file type');
    }

    const builder = new PostBuilder(this, cancellationToken)
      .asMultipart()
      .withHeader('Authorization', `Token ${this.sessionData.token}`)
      .setField('title', postData.options.title)
      .setField('description', postData.options.description)
      .setField('sections', JSON.stringify(postData.options.folders))
      .setField(
        'tags',
        JSON.stringify(
          postData.options.tags.map((tag) => ({ name: tag.substring(0, 59) })),
        ),
      )
      .setField('maturity_rating', this.convertRating(postData.options.rating))
      .setField('visibility', postData.options.visibility)
      .setConditional(
        'share_on_feed',
        isBatch || postData.options.shareOnFeed,
        postData.options.shareOnFeed,
      )
      .setConditional('content_warning', !!spoilerText, spoilerText)
      .setConditional('image', file.fileType === FileType.IMAGE, file)
      .setConditional('video', file.fileType === FileType.VIDEO, file);

    const upload = await builder.send<{ id: number }>(
      `${this.BASE_URL}/api/galleries/${
        file.fileType === FileType.IMAGE ? 'images' : 'videos'
      }/`,
    );

    return upload.body;
  }

  async postSubmission(
    postData: PostData<ItakuFileSubmission | ItakuMessageSubmission>,
    cancellationToken: CancellableToken,
    uploadedFiles?: { id: number }[],
  ): Promise<PostResponse> {
    const builder = new PostBuilder(this, cancellationToken)
      .asJson()
      .setField('title', postData.options.title)
      .setField('content', postData.options.description)
      .setField('folders', postData.options.folders)
      .setField('tags', postData.options.tags.join(','))
      .setField('maturity_rating', this.convertRating(postData.options.rating))
      .setField('visibility', postData.options.visibility)
      .setField(
        'gallery_images',
        uploadedFiles?.map((file) => file.id),
      )
      .setConditional(
        'content_warning',
        !!postData.options.contentWarning,
        postData.options.contentWarning,
      )
      .withHeader('Authorization', `Token ${this.sessionData.token}`);

    const post = await builder.send<{ id: number }>(
      `${this.BASE_URL}/api/posts/`,
    );

    if (!post.body.id) {
      return PostResponse.fromWebsite(this)
        .withMessage('Failed to post')
        .withAdditionalInfo(post.body);
    }

    return PostResponse.fromWebsite(this)
      .withSourceUrl(`${this.BASE_URL}/posts/${post.body.id}`)
      .withAdditionalInfo(post.body);
  }

  async onPostFileSubmission(
    postData: PostData<ItakuFileSubmission>,
    files: PostingFile[],
    batchIndex: number,
    cancellationToken: CancellableToken,
  ): Promise<PostResponse> {
    cancellationToken.throwIfCancelled();
    const isBatch = files.length > 1;

    const uploadedFiles = await Promise.all(
      files.map((file) =>
        this.uploadFile(postData, file, isBatch, cancellationToken),
      ),
    );

    if (isBatch) {
      const postResponse = await this.postSubmission(
        postData,
        cancellationToken,
        uploadedFiles,
      );
      return postResponse;
    }

    return PostResponse.fromWebsite(this).withSourceUrl(
      `${this.BASE_URL}/images/${uploadedFiles[0].id}`,
    );
  }

  async onValidateFileSubmission(
    postData: PostData<ItakuFileSubmission>,
  ): Promise<SimpleValidationResult> {
    const validator = this.createValidator<ItakuFileSubmission>();

    const { submission, options } = postData;
    if (!options.shareOnFeed) {
      const metadata = submission.metadata as FileSubmissionMetadata;
      const filesToPost = Object.values(metadata.fileMetadata).filter(
        ({ ignoredWebsites }) =>
          ignoredWebsites.length && !ignoredWebsites.includes(this.accountId),
      );

      if (filesToPost.length > 1) {
        validator.error(
          'validation.file.itaku.must-share-feed',
          {},
          'shareOnFeed',
        );
      }
    }

    return validator.result;
  }

  createMessageModel(): ItakuMessageSubmission {
    return new ItakuMessageSubmission();
  }

  async onPostMessageSubmission(
    postData: PostData<ItakuMessageSubmission>,
    cancellationToken: CancellableToken,
  ): Promise<PostResponse> {
    cancellationToken.throwIfCancelled();
    return this.postSubmission(postData, cancellationToken);
  }

  onValidateMessageSubmission = validatorPassthru;
}

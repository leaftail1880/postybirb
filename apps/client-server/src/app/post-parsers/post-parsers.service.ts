import { Injectable } from '@nestjs/common';
import {
  ISubmission,
  IWebsiteFormFields,
  IWebsiteOptions,
  PostData,
} from '@postybirb/types';
import { UnknownWebsite } from '../websites/website';
import { DescriptionParserService } from './parsers/description-parser.service';
import { RatingParser } from './parsers/rating-parser';
import { TagParserService } from './parsers/tag-parser.service';
import { TitleParserService } from './parsers/title-parser.service';

@Injectable()
export class PostParsersService {
  private readonly ratingParser: RatingParser = new RatingParser();

  constructor(
    private readonly tagParser: TagParserService,
    private readonly titleParser: TitleParserService,
    private readonly descriptionParser: DescriptionParserService,
  ) {}

  public async parse(
    submission: ISubmission,
    instance: UnknownWebsite,
    websiteOptions: IWebsiteOptions,
  ): Promise<PostData<ISubmission, IWebsiteFormFields>> {
    const defaultOptions: IWebsiteOptions = submission.options.find(
      (o) => o.isDefault,
    );
    const tags = await this.tagParser.parse(
      instance,
      defaultOptions,
      websiteOptions,
    );

    const title = await this.titleParser.parse(
      submission,
      instance,
      defaultOptions,
      websiteOptions,
    );

    return {
      submission,
      options: {
        ...defaultOptions.data,
        ...websiteOptions.data,
        tags,
        description: await this.descriptionParser.parse(
          instance,
          defaultOptions,
          websiteOptions,
          tags,
          title,
        ),
        title,
        rating: this.ratingParser.parse(defaultOptions, websiteOptions),
      },
    };
  }
}

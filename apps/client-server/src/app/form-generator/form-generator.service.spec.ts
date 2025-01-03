import { MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  NullAccount,
  SubmissionRating,
  SubmissionType,
} from '@postybirb/types';
import { AccountModule } from '../account/account.module';
import { AccountService } from '../account/account.service';
import { DatabaseModule } from '../database/database.module';
import { CreateUserSpecifiedWebsiteOptionsDto } from '../user-specified-website-options/dtos/create-user-specified-website-options.dto';
import { UserSpecifiedWebsiteOptionsModule } from '../user-specified-website-options/user-specified-website-options.module';
import { UserSpecifiedWebsiteOptionsService } from '../user-specified-website-options/user-specified-website-options.service';
import { WebsitesModule } from '../websites/websites.module';
import { FormGeneratorService } from './form-generator.service';

describe('FormGeneratorService', () => {
  let service: FormGeneratorService;
  let userSpecifiedService: UserSpecifiedWebsiteOptionsService;
  let accountService: AccountService;
  let module: TestingModule;
  let orm: MikroORM;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        AccountModule,
        WebsitesModule,
        UserSpecifiedWebsiteOptionsModule,
      ],
      providers: [FormGeneratorService],
    }).compile();

    service = module.get<FormGeneratorService>(FormGeneratorService);
    accountService = module.get<AccountService>(AccountService);
    userSpecifiedService = module.get<UserSpecifiedWebsiteOptionsService>(
      UserSpecifiedWebsiteOptionsService,
    );
    orm = module.get(MikroORM);
    try {
      await orm.getSchemaGenerator().refreshDatabase();
    } catch {
      // none
    }

    await accountService.onModuleInit();
  });

  afterAll(async () => {
    await orm.close(true);
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fail on missing account', async () => {
    await expect(
      service.generateForm({ accountId: 'fake', type: SubmissionType.MESSAGE }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return user specific defaults', async () => {
    const userSpecifiedDto = new CreateUserSpecifiedWebsiteOptionsDto();
    userSpecifiedDto.account = new NullAccount().id;
    userSpecifiedDto.type = SubmissionType.MESSAGE;
    userSpecifiedDto.options = { rating: SubmissionRating.ADULT };
    await userSpecifiedService.create(userSpecifiedDto);

    const messageForm = await service.getDefaultForm(SubmissionType.MESSAGE);
    expect(messageForm).toEqual({
      contentWarning: {
        col: 1,
        defaultValue: '',
        formField: 'input',
        label: 'Content Warning / Spoilers',
        row: 2,
        type: 'text',
      },
      description: {
        col: 1,
        defaultValue: {
          description: [],
          overrideDefault: false,
        },
        formField: 'description',
        i18nLabel: 'form.descriptions',
        label: 'Description',
        row: 3,
        type: 'description',
      },
      rating: {
        col: 0,
        defaultValue: SubmissionRating.ADULT,
        formField: 'rating',
        label: 'Rating',
        layout: 'vertical',
        options: [
          {
            label: 'General',
            value: 'GENERAL',
          },
          {
            label: 'Mature',
            value: 'MATURE',
          },
          {
            label: 'Adult',
            value: 'ADULT',
          },
          {
            label: 'Extreme',
            value: 'EXTREME',
          },
        ],
        required: true,
        row: 0,
        type: 'rating',
      },
      tags: {
        col: 1,
        defaultValue: {
          overrideDefault: false,
          tags: [],
        },
        formField: 'tag',
        i18nLabel: 'form.tags',
        label: 'Tags',
        row: 1,
        type: 'tag',
      },
      title: {
        col: 1,
        defaultValue: '',
        formField: 'input',
        label: 'Title',
        required: true,
        row: 0,
        type: 'text',
      },
    });
  });

  it('should return standard form', async () => {
    const messageForm = await service.getDefaultForm(SubmissionType.MESSAGE);
    expect(messageForm).toEqual({
      contentWarning: {
        col: 1,
        defaultValue: '',
        formField: 'input',
        label: 'Content Warning / Spoilers',
        row: 2,
        type: 'text',
      },
      description: {
        col: 1,
        defaultValue: {
          description: [],
          overrideDefault: false,
        },
        formField: 'description',
        i18nLabel: 'form.descriptions',
        label: 'Description',
        row: 3,
        type: 'description',
      },
      rating: {
        col: 0,
        defaultValue: 'GENERAL',
        formField: 'rating',
        label: 'Rating',
        layout: 'vertical',
        options: [
          {
            label: 'General',
            value: 'GENERAL',
          },
          {
            label: 'Mature',
            value: 'MATURE',
          },
          {
            label: 'Adult',
            value: 'ADULT',
          },
          {
            label: 'Extreme',
            value: 'EXTREME',
          },
        ],
        required: true,
        row: 0,
        type: 'rating',
      },
      tags: {
        col: 1,
        defaultValue: {
          overrideDefault: false,
          tags: [],
        },
        formField: 'tag',
        i18nLabel: 'form.tags',
        label: 'Tags',
        row: 1,
        type: 'tag',
      },
      title: {
        col: 1,
        defaultValue: '',
        formField: 'input',
        label: 'Title',
        required: true,
        row: 0,
        type: 'text',
      },
    });

    const fileForm = await service.getDefaultForm(SubmissionType.FILE);
    expect(fileForm).toEqual({
      contentWarning: {
        col: 1,
        defaultValue: '',
        formField: 'input',
        label: 'Content Warning / Spoilers',
        row: 2,
        type: 'text',
      },
      description: {
        col: 1,
        defaultValue: {
          description: [],
          overrideDefault: false,
        },
        formField: 'description',
        i18nLabel: 'form.descriptions',
        label: 'Description',
        row: 3,
        type: 'description',
      },
      rating: {
        col: 0,
        defaultValue: 'GENERAL',
        formField: 'rating',
        label: 'Rating',
        layout: 'vertical',
        options: [
          {
            label: 'General',
            value: 'GENERAL',
          },
          {
            label: 'Mature',
            value: 'MATURE',
          },
          {
            label: 'Adult',
            value: 'ADULT',
          },
          {
            label: 'Extreme',
            value: 'EXTREME',
          },
        ],
        required: true,
        row: 0,
        type: 'rating',
      },
      tags: {
        col: 1,
        defaultValue: {
          overrideDefault: false,
          tags: [],
        },
        formField: 'tag',
        i18nLabel: 'form.tags',
        label: 'Tags',
        row: 1,
        type: 'tag',
      },
      title: {
        col: 1,
        defaultValue: '',
        formField: 'input',
        label: 'Title',
        required: true,
        row: 0,
        type: 'text',
      },
    });
  });
});

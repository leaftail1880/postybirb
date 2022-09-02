import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import {
  BaseWebsiteOptions,
  ISubmissionOptions,
  IBaseSubmissionMetadata,
  IAccount,
} from '@postybirb/types';
import { Account } from './account.entity';
import { BaseEntity } from './base.entity';
import { Submission } from './submission.entity';

@Entity()
export class SubmissionOptions<T extends BaseWebsiteOptions>
  extends BaseEntity<SubmissionOptions<T>, 'id'>
  implements ISubmissionOptions<T>
{
  @ManyToOne({
    entity: () => Submission,
    cascade: [],
    inversedBy: 'options',
    nullable: true,
  })
  submission: Submission<IBaseSubmissionMetadata>;

  @Property({ type: 'json', nullable: false })
  data: T;

  @ManyToOne(() => Account, { nullable: true })
  account?: IAccount;
}

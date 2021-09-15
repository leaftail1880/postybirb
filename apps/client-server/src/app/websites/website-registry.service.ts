import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Account } from '../account/entities/account.entity';
import { Ctor } from '../shared/interfaces/constructor.interface';
import * as websites from './implementations';
import Website from './website';

type WebsiteInstances = Record<
  string,
  Record<string, Website<Record<string, unknown>>>
>;

@Injectable()
export class WebsiteRegistryService implements OnModuleInit {
  private readonly logger: Logger = new Logger(WebsiteRegistryService.name);

  private readonly availableWebsites: Record<
    string,
    Ctor<Website<Record<string, unknown>>>
  > = {};

  private readonly websiteInstances: WebsiteInstances = {};

  onModuleInit() {
    Object.values({ ...websites }).forEach(
      (website: Ctor<Website<Record<string, unknown>>>) => {
        if (!website.prototype.metadata.name) {
          throw new Error(`${website.name} is missing metadata field "name"`);
        }

        this.logger.verbose(
          `Registering website: ${website.prototype.metadata.name}`
        );
        this.availableWebsites[website.prototype.metadata.name] = website;
      }
    );
  }

  public async create(account: Account): Promise<void> {
    const { name, id } = account;
    if (this.availableWebsites[name]) {
      const websiteCtor = this.availableWebsites[name];
      if (!this.websiteInstances[name]) {
        this.websiteInstances[name] = {};
      }

      if (!this.websiteInstances[name][id]) {
        this.logger.log(`Creating instance of "${name}" with id "${id}"`);
        this.websiteInstances[name][id] = new websiteCtor(account);
      } else {
        this.logger.warn(
          `An instance of "${name}" with id "${id}" already exists`
        );
      }
    } else {
      this.logger.error(`Unable to find website name "${name}"`);
    }
  }
}

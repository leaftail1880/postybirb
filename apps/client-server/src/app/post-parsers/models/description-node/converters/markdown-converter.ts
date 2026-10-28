import { TipTapNode } from '@postybirb/types';
import TurndownService from 'turndown';
import { ConversionContext } from '../description-node.base';
import { HtmlConverter } from './html-converter';

export class MarkdownConverter extends HtmlConverter {
  protected createConverter(turndownInstance = new TurndownService()) {
    turndownInstance.addRule('nestedIndent', {
      filter: (node) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((node as any).nodeName === 'DIV' &&
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (node as any).getAttribute('style')?.includes('margin-left')) ??
        false,

      replacement: (content) =>
        `\n\n> ${content.trim().replace(/\n/g, '\n> ')}\n\n`,
    });

    return turndownInstance;
  }

  convert(nodes: TipTapNode[], context: ConversionContext): string {
    const converter = this.createConverter();
    const html = super.convert(nodes, context);

    return converter.turndown(html);
  }
}

import { msg } from '@lingui/macro';
import 'dayjs/locale/es';
import 'dayjs/locale/ru';

export const languages = [
  [msg`English`, 'en'],
  [msg`Russian`, 'ru'],
  [msg`Spanish`, 'es'],
  [msg`Lithuanian`, 'lt'],
  [msg`Portuguese (Brazil)`, 'pt_BR'],
  [msg`German`, 'de'],
  [msg`Tamil`, 'ta']
] as const;

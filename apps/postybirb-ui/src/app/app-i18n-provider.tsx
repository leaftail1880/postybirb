/* eslint-disable lingui/no-unlocalized-strings */
import { i18n } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { Group, Loader } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { use18n } from '../hooks/use-i18n';

declare module '@lingui/core' {
  interface I18n {}
}

type AppI18nProviderProps = {
  children: React.ReactNode;
};

export function AppI18nProvider({ children }: AppI18nProviderProps) {
  const [locale] = use18n();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Vite plugin lingui automatically converts .po
    // files into plain json during production build
    // and vite converts dynamic import into the path map
    //
    // We dont need to cache these imported messages
    // because browser's import call does it automatically
    import(`../../../../lang/${locale}.po`).then(({ messages }) => {
      i18n.loadAndActivate({ locale, messages });
      setLoaded(true);
    });
  }, [locale]);

  const [tooLongLoading, setTooLongLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (!loaded) setTooLongLoading(true);
    }, 5000);
  }, []);

  if (loaded) {
    return (
      <LinguiI18nProvider i18n={i18n}>
        <DatesProvider settings={{ locale }}>{children}</DatesProvider>
      </LinguiI18nProvider>
    );
  }

  return (
    <Group justify="center" align="center">
      <Loader />
      <div>Loading translations...</div>
      {tooLongLoading &&
        'Loading takes too much time, please check the console for the errors.'}
    </Group>
  );
}

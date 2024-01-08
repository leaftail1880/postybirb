import {
  EuiButton,
  EuiErrorBoundary,
  EuiFieldNumber,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelectable,
  EuiSelectableOption,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
} from '@elastic/eui';
import { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLingui } from '@lingui/react';
import { Trans, msg } from '@lingui/macro';
import settingsApi from '../api/settings.api';
import Keybinding, {
  KeybindingProps,
} from '../components/app/keybinding/keybinding';
import Loading from '../components/shared/loading/loading';
import { useFlyoutToggle } from '../hooks/use-flyout-toggle';
import { SettingsKeybinding } from '../shared/app-keybindings';
import { AppThemeContext } from './app-theme-provider';
import { useStore } from '../stores/use-store';
import { SettingsStore } from '../stores/settings.store';

function StartupSettings() {
  const { data, isLoading, refetch } = useQuery(
    'startup',
    () => settingsApi.getStartupOptions().then((res) => res.body),
    {
      cacheTime: 0,
    }
  );

  const { _ } = useLingui();

  return (
    <Loading isLoading={isLoading}>
      <div>
        <EuiTitle size="xxs">
          <h5>
            <Trans>PostyBirb Startup Settings</Trans>
          </h5>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiForm>
          <EuiFormRow label={<Trans>Open on startup</Trans>}>
            <EuiSwitch
              name="switch"
              label={
                data?.startAppOnSystemStartup ? (
                  <Trans>PostyBirb will open on startup</Trans>
                ) : (
                  <Trans>PostyBirb will not open on startup</Trans>
                )
              }
              onChange={(e) => {
                settingsApi
                  .updateSystemStartupSettings({
                    startAppOnSystemStartup: e.target.checked,
                  })
                  .finally(refetch);
              }}
              checked={data?.startAppOnSystemStartup ?? false}
            />
          </EuiFormRow>
          <EuiFormRow
            label={<Trans>App Server Port</Trans>}
            helpText={
              <Trans>
                This is the port the app server will run on. You must restart
                the app for this to take effect.
              </Trans>
            }
          >
            <EuiFieldNumber
              min={1025}
              max={65535}
              value={data?.port ?? '9487'}
              onChange={(e) => {
                if (!e.target.value?.trim()) {
                  return;
                }

                settingsApi
                  .updateSystemStartupSettings({
                    port: e.target.value?.trim(),
                  })
                  .finally(refetch);
              }}
            />
          </EuiFormRow>
          <EuiFormRow
            label={<Trans>App Folder</Trans>}
            helpText={
              <Trans>
                This is the folder where the app will store its data. You must
                restart the app for this to take effect.
              </Trans>
            }
          >
            <EuiButton
              onClick={() => {
                if (window?.electron?.pickDirectory) {
                  window.electron.pickDirectory().then((appDataPath) => {
                    if (appDataPath) {
                      settingsApi
                        .updateSystemStartupSettings({
                          appDataPath,
                        })
                        .finally(() => {
                          refetch();
                        });
                    }
                  });
                }
              }}
              iconType="folderClosed"
            >
              {data?.appDataPath ?? _(msg`Select Folder`)}
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </div>
    </Loading>
  );
}

const languages = [
  [msg`English`, 'en'],
  [msg`Russian`, 'ru'],
] as const;

function LanguageSettings() {
  const {
    state: [settings],
    reload: reloadSettings,
    isLoading,
  } = useStore(SettingsStore);
  const { _ } = useLingui();
  const [options, setOptions] = useState<EuiSelectableOption[]>([]);

  useEffect(() => {
    // It should update only once
    if (!isLoading && options.length === 0)
      setOptions(
        languages.map(([label, content]) => ({
          label: _(label),
          content,
          checked: content === settings.settings.language ? 'on' : undefined,
        }))
      );
      
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <Loading isLoading={isLoading}>
      <EuiForm component="form" className="postybirb__settings">
        <EuiFormRow label={<Trans>Language</Trans>} hasChildLabel={false}>
          <EuiSelectable
            aria-label={_(msg`Select language`)}
            options={options}
            onChange={(newOptions: EuiSelectableOption[]) => {
              const selected = newOptions.find((e) => e.checked === 'on');
              if (!selected || !selected.content) return;

              // Because src/i18n.tsx is subscribed to settings
              // change we dont need to call anything here
              setOptions(newOptions);
              settingsApi
                .update(settings.id, {
                  settings: {
                    ...settings.settings,
                    language: selected.content,
                  },
                })
                .finally(reloadSettings);
            }}
            singleSelection
            listProps={{ bordered: true }}
          >
            {(list) => list}
          </EuiSelectable>
        </EuiFormRow>
      </EuiForm>
    </Loading>
  );
}

export default function AppSettings() {
  const [isOpen, toggle] = useFlyoutToggle('settingsVisible');
  const keybindingProps: KeybindingProps = {
    keybinding: SettingsKeybinding,
    onActivate: () => {},
  };

  const [theme, setTheme] = useContext(AppThemeContext);

  if (!isOpen) {
    return null;
  }

  return (
    <EuiFlyout
      ownFocus
      onClose={() => {
        toggle(false);
      }}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <div>
            <Keybinding displayOnly {...keybindingProps}>
              <Trans>Settings</Trans>
            </Keybinding>
          </div>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" className="postybirb__settings">
          <EuiFormRow label={<Trans>Theme</Trans>} hasChildLabel={false}>
            <EuiSwitch
              name="switch"
              label={
                theme === 'light' ? (
                  <Trans>Light theme</Trans>
                ) : (
                  <Trans>Dark theme</Trans>
                )
              }
              onChange={() => {
                setTheme(theme === 'light' ? 'dark' : 'light');
              }}
              checked={theme === 'light'}
            />
          </EuiFormRow>
        </EuiForm>
        <EuiSpacer />
        <EuiErrorBoundary>
          <LanguageSettings />
        </EuiErrorBoundary>
        <EuiSpacer />
        <StartupSettings />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}

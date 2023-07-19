import { EuiSpacer } from '@elastic/eui';
import { IWebsiteInfoDto, SettingsDto } from '@postybirb/types';
import { useLocalStorage } from 'react-use';
import settingsApi from '../../../api/settings.api';
import { ArrayHelper } from '../../../helpers/array.helper';
import { DisplayableWebsiteLoginInfo } from '../../../models/displayable-website-login-info';
import { AccountStore } from '../../../stores/account.store';
import { useStore } from '../../../stores/use-store';
import AccountLoginCard from '../account-login-card/account-login-card';
import { AccountLoginFilters } from './account-login-filters';

type AccountLoginContainerProps = {
  availableWebsites: IWebsiteInfoDto[];
  settings: SettingsDto;
};

function filterWebsites(
  availableWebsites: IWebsiteInfoDto[],
  hiddenWebsites: string[],
  filters: { showHidden: boolean }
): DisplayableWebsiteLoginInfo[] {
  let filteredWebsites = availableWebsites;
  if (!filters.showHidden) {
    filteredWebsites = filteredWebsites.filter(
      (w) => !hiddenWebsites.includes(w.id)
    );
  }

  return filteredWebsites.map((w) => ({
    ...w,
    isHidden: !hiddenWebsites.includes(w.id),
  }));
}

export type AccountFilterState = {
  showHiddenAccounts: boolean;
};

const DEFAULT_FILTER_STATE: AccountFilterState = {
  showHiddenAccounts: true,
};

export function AccountLoginContainer(
  props: AccountLoginContainerProps
): JSX.Element {
  const { availableWebsites, settings: settingsDto } = props;
  const { settings } = settingsDto;

  const { state: accounts } = useStore(AccountStore);
  const [filterState, setFilterState] = useLocalStorage<AccountFilterState>(
    'account-filters',
    DEFAULT_FILTER_STATE
  );

  const websites = filterWebsites(availableWebsites, settings.hiddenWebsites, {
    showHidden: filterState?.showHiddenAccounts || false,
  });

  const groups = ArrayHelper.unique(
    accounts.flatMap((account) => account.groups)
  );

  const onHideWebsite = (websiteInfo: DisplayableWebsiteLoginInfo) => {
    let hiddenWebsites = [...settings.hiddenWebsites];
    if (settings.hiddenWebsites.includes(websiteInfo.id)) {
      // Show
      hiddenWebsites = [...settings.hiddenWebsites].filter(
        (w) => w !== websiteInfo.id
      );
    } else {
      // Hide
      hiddenWebsites.push(websiteInfo.id);
    }

    // eslint-disable-next-line react/destructuring-assignment
    const updatedSettings = { ...props.settings };
    updatedSettings.settings = {
      ...updatedSettings.settings,
      hiddenWebsites,
    };

    settingsApi.update(updatedSettings.id, updatedSettings);
  };

  return (
    <div className="account-login-container">
      <AccountLoginFilters
        filterState={filterState ?? DEFAULT_FILTER_STATE}
        settings={settings}
        availableWebsites={availableWebsites}
        onFilterUpdate={setFilterState}
        onHide={onHideWebsite}
      />
      <EuiSpacer />
      <div className="account-login-list">
        {websites.map((website) => (
          <AccountLoginCard
            key={website.id}
            website={website}
            groups={groups}
            instances={accounts
              .filter((account) => account.website === website.id)
              .sort((a, b) => a.name.localeCompare(b.name))}
            onHide={onHideWebsite}
          />
        ))}
      </div>
    </div>
  );
}
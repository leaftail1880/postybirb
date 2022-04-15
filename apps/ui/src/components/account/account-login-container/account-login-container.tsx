import { EuiFilterButton, EuiFilterGroup, EuiSpacer } from '@elastic/eui';
import { ISettingsDto, IWebsiteLoginInfo } from '@postybirb/dto';
import { FormattedMessage } from 'react-intl';
import { useLocalStorage } from 'react-use';
import { AccountStore } from '../../../stores/account.store';
import useStore from '../../../stores/use-store';
import AccountLoginCard from './account-login-card';

type AccountLoginContainerProps = {
  availableWebsites: IWebsiteLoginInfo[];
  settings: ISettingsDto;
};

function filterWebsites(
  availableWebsites: IWebsiteLoginInfo[],
  hiddenWebsites: string[],
  filters: { showHidden: boolean }
): IWebsiteLoginInfo[] {
  let filteredWebsites = availableWebsites;
  if (!filters.showHidden) {
    filteredWebsites = filteredWebsites.filter(
      (w) => !hiddenWebsites.includes(w.id)
    );
  }

  return filteredWebsites;
}

export function AccountLoginContainer(
  props: AccountLoginContainerProps
): JSX.Element {
  const [isHiddenFilterOn, setHiddenFilter] = useLocalStorage(
    'show-hidden-accounts',
    false
  );

  // eslint-disable-next-line react/destructuring-assignment
  const { settings } = props.settings;

  const { isLoading, state, reload } = useStore(AccountStore);
  const { availableWebsites } = props;

  const toggleHiddenFilter = () => setHiddenFilter(!isHiddenFilterOn);

  const websites = filterWebsites(availableWebsites, settings.hiddenWebsites, {
    showHidden: isHiddenFilterOn || false,
  });

  return (
    <div className="account-login-container">
      <div className="account-login-filters">
        <EuiFilterGroup compressed>
          <EuiFilterButton
            aria-label="Show hidden accounts filter"
            hasActiveFilters={isHiddenFilterOn}
            onClick={toggleHiddenFilter}
          >
            <FormattedMessage
              id="account.login.hidden-filter"
              defaultMessage="Show hidden"
            />
          </EuiFilterButton>
        </EuiFilterGroup>
      </div>
      <EuiSpacer />
      <div className="account-login-list">
        {websites.map((website) => (
          <AccountLoginCard
            key={website.id}
            website={website}
            onHide={() => {
              // TODO
            }}
          />
        ))}
      </div>
    </div>
  );
}

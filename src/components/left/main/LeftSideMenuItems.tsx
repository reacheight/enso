import type React from '../../../lib/teact/teact';
import { memo, useMemo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiUser } from '../../../api/types';
import type { GlobalState } from '../../../global/types';
import type { AnimationLevel, FocusMode, ThemeKey } from '../../../types';

import {
  ANIMATION_LEVEL_MAX,
  ANIMATION_LEVEL_MIN,
  ARCHIVED_FOLDER_ID,
  BETA_CHANGELOG_URL,
  IS_BETA,
} from '../../../config';
import {
  INITIAL_PERFORMANCE_STATE_MAX,
  INITIAL_PERFORMANCE_STATE_MED,
  INITIAL_PERFORMANCE_STATE_MIN,
} from '../../../global/initialState';
import { selectTheme, selectUser } from '../../../global/selectors';
import { selectPremiumLimit } from '../../../global/selectors/limits';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import { IS_MULTIACCOUNT_SUPPORTED } from '../../../util/browser/globalEnvironment';

import { useFolderManagerForUnreadCounters } from '../../../hooks/useFolderManager';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import AttachBotItem from '../../middle/composer/AttachBotItem';
import MenuItem from '../../ui/MenuItem';
import MenuSeparator from '../../ui/MenuSeparator';
import Switcher from '../../ui/Switcher';
import Toggle from '../../ui/Toggle';
import AccountMenuItems from './AccountMenuItems';

type OwnProps = {
  onSelectSettings: NoneToVoidFunction;
  onSelectContacts: NoneToVoidFunction;
  onSelectArchived: NoneToVoidFunction;
  onBotMenuOpened: NoneToVoidFunction;
  onBotMenuClosed: NoneToVoidFunction;
};

type StateProps = {
  animationLevel: AnimationLevel;
  currentUser?: ApiUser;
  theme: ThemeKey;
  attachBots: GlobalState['attachMenu']['bots'];
  accountsTotalLimit: number;
} & Pick<GlobalState, 'currentUserId' | 'archiveSettings' | 'focusMode'>;

const LeftSideMenuItems = ({
  archiveSettings,
  animationLevel,
  theme,
  attachBots,
  currentUser,
  accountsTotalLimit,
  focusMode,
  onSelectArchived,
  onSelectContacts,
  onSelectSettings,
  onBotMenuOpened,
  onBotMenuClosed,
}: OwnProps & StateProps) => {
  const {
    setSharedSettingOption,
    updatePerformanceSettings,
    setFocusMode,
  } = getActions();
  const lang = useLang();

  const animationLevelValue = animationLevel !== ANIMATION_LEVEL_MIN
    ? (animationLevel === ANIMATION_LEVEL_MAX ? 'max' : 'mid') : 'min';

  const archivedUnreadChatsCount = useFolderManagerForUnreadCounters()[ARCHIVED_FOLDER_ID]?.chatsCount || 0;

  const bots = useMemo(() => Object.values(attachBots).filter((bot) => bot.isForSideMenu), [attachBots]);

  const handleDarkModeToggle = useLastCallback((e: React.SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    const newTheme = theme === 'light' ? 'dark' : 'light';

    setSharedSettingOption({ theme: newTheme });
    setSharedSettingOption({ shouldUseSystemTheme: false });
  });

  const handleAnimationLevelChange = useLastCallback((e: React.SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();

    let newLevel = animationLevel + 1;
    if (newLevel > ANIMATION_LEVEL_MAX) {
      newLevel = ANIMATION_LEVEL_MIN;
    }
    const performanceSettings = newLevel === ANIMATION_LEVEL_MIN
      ? INITIAL_PERFORMANCE_STATE_MIN
      : (newLevel === ANIMATION_LEVEL_MAX ? INITIAL_PERFORMANCE_STATE_MAX : INITIAL_PERFORMANCE_STATE_MED);

    setSharedSettingOption({ animationLevel: newLevel as AnimationLevel, wasAnimationLevelSetManually: true });
    updatePerformanceSettings(performanceSettings);
  });

  const handleChangelogClick = useLastCallback(() => {
    window.open(BETA_CHANGELOG_URL, '_blank', 'noopener,noreferrer');
  });

  const handleFocusModeToggle = useLastCallback((e: React.SyntheticEvent<HTMLElement>) => {
    e.stopPropagation();
    
    if (!focusMode) {
      setFocusMode({ mode: 'noDistraction' });
      return;
    }

    if (focusMode === 'noDistraction') {
      setFocusMode({ mode: 'deepWork' });
      return;
    }

    setFocusMode({ mode: undefined });
  });

  const focusModeToToggleLevel = (focusMode: FocusMode | undefined) => !focusMode ? 'min' : (focusMode === 'noDistraction' ? 'mid' : 'max');

  return (
    <>
      {IS_MULTIACCOUNT_SUPPORTED && currentUser && (
        <>
          <AccountMenuItems
            currentUser={currentUser}
            totalLimit={accountsTotalLimit}
            onSelectCurrent={onSelectSettings}
          />
          <MenuSeparator />
        </>
      )}
      {archiveSettings.isHidden && (
        <MenuItem
          icon="archive"
          onClick={onSelectArchived}
        >
          <span className="menu-item-name">{lang('MenuArchivedChats')}</span>
          {archivedUnreadChatsCount > 0 && (
            <div className="right-badge">{archivedUnreadChatsCount}</div>
          )}
        </MenuItem>
      )}
      <MenuItem
        icon="group"
        onClick={onSelectContacts}
      >
        {lang('MenuContacts')}
      </MenuItem>
      {bots.map((bot) => (
        <AttachBotItem
          bot={bot}
          theme={theme}
          isInSideMenu
          canShowNew
          onMenuOpened={onBotMenuOpened}
          onMenuClosed={onBotMenuClosed}
        />
      ))}
      <MenuItem
        icon="settings"
        onClick={onSelectSettings}
      >
        {lang('MenuSettings')}
      </MenuItem>
      <MenuItem
        icon="darkmode"
        onClick={handleDarkModeToggle}
      >
        <span className="menu-item-name">{lang('MenuNightMode')}</span>
        <Switcher
          id="darkmode"
          label={lang(theme === 'dark' ? 'AriaMenuDisableNightMode' : 'AriaMenuEnableNightMode')}
          checked={theme === 'dark'}
          noAnimation
        />
      </MenuItem>
      <MenuItem
        icon="unmute"
        onClick={handleFocusModeToggle}
      >
        <span className="menu-item-name">{lang('MenuFocusMode')}</span>
        <Toggle value={focusModeToToggleLevel(focusMode)} />
      </MenuItem>
      <MenuItem
        icon="animations"
        onClick={handleAnimationLevelChange}
      >
        <span className="menu-item-name capitalize">{lang('MenuAnimationsSwitch')}</span>
        <Toggle value={animationLevelValue} />
      </MenuItem>
      {IS_BETA && (
        <MenuItem
          icon="permissions"
          onClick={handleChangelogClick}
        >
          {lang('MenuBetaChangelog')}
        </MenuItem>
      )}
    </>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const {
      currentUserId, archiveSettings, focusMode,
    } = global;
    const { animationLevel } = selectSharedSettings(global);
    const attachBots = global.attachMenu.bots;

    return {
      currentUserId,
      currentUser: selectUser(global, currentUserId!),
      theme: selectTheme(global),
      animationLevel,
      archiveSettings,
      attachBots,
      accountsTotalLimit: selectPremiumLimit(global, 'moreAccounts'),
      focusMode,
    };
  },
)(LeftSideMenuItems));

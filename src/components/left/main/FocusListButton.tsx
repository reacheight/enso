import { getActions, withGlobal } from '../../../global';
import { selectFocusListCount, selectTabState } from '../../../global/selectors';
import type { FC } from '../../../lib/teact/teact';
import React, { memo } from '../../../lib/teact/teact';
import buildClassName from '../../../util/buildClassName';
import UnreadBadge from '../../common/CustomUnreadBadge';

export const TargetIcon: FC = () => (
  <span className="icon">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.3"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2.3"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  </span>
);

import './FocusListButton.scss';

type StateProps = {
  isActive?: boolean;
  count?: number;
}

const FocusListButton: FC<StateProps> = ({ isActive, count }) => {
  const { toggleFocusList } = getActions();

  return (
    <div
      onClick={() => toggleFocusList()}
      className={buildClassName('FocusListButton-trigger', isActive && 'active')}
    >
      <TargetIcon />  
      Priority
      {count !== undefined && count !== 0 && (
        <UnreadBadge count={count} isInactive={true} className="FocusListButton-count" />
      )}
    </div>
  );
};

export default memo(withGlobal<StateProps>(
  (global): StateProps => {
    const { isFocusListShown } = selectTabState(global);

    return {
      isActive: isFocusListShown,
      count: selectFocusListCount(global),
    }
  }
)(FocusListButton));

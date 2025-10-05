import { getActions, withGlobal } from '../../../global';
import { selectTabState } from '../../../global/selectors';
import type { FC } from '../../../lib/teact/teact';
import React, { memo } from '../../../lib/teact/teact';
import buildClassName from '../../../util/buildClassName';
import Icon from '../../common/icons/Icon';

import './FocusListButton.scss';

type StateProps = {
  isActive?: boolean;
}

const FocusListButton: FC<StateProps> = ({ isActive }) => {
  const { toggleFocusList } = getActions();

  return (
    <div
      onClick={() => toggleFocusList()}
      className={buildClassName('FocusListButton-trigger', isActive && 'active')}
    >
      <Icon name="favorite" />  
      Focus
    </div>
  );
};

export default memo(withGlobal<StateProps>(
  (global): StateProps => {
    const { isFocusListShown } = selectTabState(global);

    return {
      isActive: isFocusListShown,
    }
  }
)(FocusListButton));

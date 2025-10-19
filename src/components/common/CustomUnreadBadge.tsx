import type { FC } from '../../lib/teact/teact';
import React, { memo } from '../../lib/teact/teact';
import buildClassName from '../../util/buildClassName';

import './CustomUnreadBadge.scss';

type OwnProps = {
  count: number;
  className?: string;
  maxCount?: number;
  isInactive?: boolean;
};

const UnreadBadge: FC<OwnProps> = ({ count, className, maxCount = 99, isInactive = false }) => {
  if (count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span className={buildClassName('UnreadBadge', isInactive && 'inactive', className)}>
      {displayCount}
    </span>
  );
};

export default memo(UnreadBadge);

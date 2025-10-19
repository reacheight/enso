import type { FC } from '../../lib/teact/teact';
import { memo, useEffect } from '../../lib/teact/teact';

import { updateAppBadge } from '../../util/appBadge';
import { getAllUnmutedChatsCount } from '../../util/folderManager';
import { formatIntegerCompact } from '../../util/textFormat';

import { useFolderManagerForUnreadCounters } from '../../hooks/useFolderManager';
import useLang from '../../hooks/useLang';

interface OwnProps {
  isForAppBadge?: boolean;
}

const UnreadCounter: FC<OwnProps> = ({ isForAppBadge }) => {
  useFolderManagerForUnreadCounters();
  const unmutedChatsCount = getAllUnmutedChatsCount();

  const lang = useLang();

  useEffect(() => {
    if (isForAppBadge) {
      updateAppBadge(unmutedChatsCount);
    }
  }, [isForAppBadge, unmutedChatsCount]);

  if (isForAppBadge || !unmutedChatsCount) {
    return undefined;
  }

  return (
    <div className="unread-count active">{formatIntegerCompact(lang, unmutedChatsCount)}</div>
  );
};

export default memo(UnreadCounter);

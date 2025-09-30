import { memo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiChat, ApiMessage, ApiPeer, ApiWebPage } from '../../../api/types';

import {
  getMessageIsSpoiler,
  getMessageRoundVideo,
  getMessageSticker,
  getMessageVideo,
} from '../../../global/helpers';
import { getMessageSenderName } from '../../../global/helpers/peers';
import { selectWebPageFromMessage } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import renderText from '../../common/helpers/renderText';

import useMessageMediaHash from '../../../hooks/media/useMessageMediaHash';
import useThumbnail from '../../../hooks/media/useThumbnail';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import useMedia from '../../../hooks/useMedia';

import Avatar from '../../common/Avatar';
import FullNameTitle from '../../common/FullNameTitle';
import LastMessageMeta from '../../common/LastMessageMeta';
import MessageSummary from '../../common/MessageSummary';

import styles from './MiddleSearchResult.module.scss';

type OwnProps = {
  isActive?: boolean;
  message: ApiMessage;
  senderPeer?: ApiPeer;
  messageChat?: ApiChat;
  shouldShowChat?: boolean;
  query?: string;
  className?: string;
  onClick: (message: ApiMessage) => void;
};

type StateProps = {
  webPage?: ApiWebPage;
};

const TRUNCATE_LENGTH = 200;

const MiddleSearchResult = ({
  isActive,
  message,
  senderPeer,
  messageChat,
  shouldShowChat,
  query,
  className,
  onClick,
  webPage,
}: OwnProps & StateProps) => {
  const lang = useLang();
  const hiddenForwardTitle = message.forwardInfo?.hiddenUserName;

  const peer = shouldShowChat ? messageChat : senderPeer;

  const senderName = shouldShowChat && senderPeer ? getMessageSenderName(lang, message.chatId, senderPeer) : undefined;

  const thumbDataUri = useThumbnail(message);
  const mediaThumbnail = !getMessageSticker(message) ? thumbDataUri : undefined;
  const mediaHash = useMessageMediaHash(message, 'pictogram');
  const mediaBlobUrl = useMedia(mediaHash);
  const isRoundVideo = Boolean(getMessageRoundVideo(message));
  const hasVideo = Boolean(getMessageVideo(message));
  const isSpoiler = getMessageIsSpoiler(message);
  const hasMediaPreview = Boolean(mediaBlobUrl || mediaThumbnail);

  const webPageInfo = webPage?.webpageType === 'full' ? {
    siteName: webPage.siteName || webPage.displayUrl,
    title: webPage.title,
    url: webPage.url,
    isSafe: message.content.webPage?.isSafe,
  } : undefined;

  const handleClick = useLastCallback(() => {
    onClick(message);
  });

  const handleWebPageClick = useLastCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!webPageInfo?.url) return;

    const { openUrl } = getActions();
    openUrl({ url: webPageInfo.url, shouldSkipModal: webPageInfo.isSafe });
  });

  const handleMediaClick = useLastCallback((e: React.MouseEvent) => {
    if (webPageInfo?.url) {
      e.stopPropagation();
      const { openUrl } = getActions();
      openUrl({ url: webPageInfo.url, shouldSkipModal: webPageInfo.isSafe });
    }
  });

  return (
    <div
      role="button"
      tabIndex={0}
      className={buildClassName(styles.root, isActive && styles.active, className)}
      onClick={handleClick}
    >
      <Avatar
        className={styles.avatar}
        peer={peer}
        text={hiddenForwardTitle}
        size="medium"
      />
      <div className={styles.info}>
        <div className={styles.topRow}>
          {(peer && <FullNameTitle peer={peer} withEmojiStatus />) || hiddenForwardTitle}
          <LastMessageMeta className={styles.meta} message={message} />
        </div>
        <div className={styles.subtitle} dir="auto">
          {senderName && (
            <>
              <span className="sender-name">{renderText(senderName)}</span>
              <span className="colon">:</span>
            </>
          )}
          <MessageSummary message={message} highlight={query} truncateLength={TRUNCATE_LENGTH} />
        </div>
        {webPageInfo && (
          <div
            className={styles.webPageInfo}
            onClick={handleWebPageClick}
            role="button"
            tabIndex={0}
            title={webPageInfo.url}
          >
            <div className={styles.webPageSite}>{renderText(webPageInfo.siteName)}</div>
            {webPageInfo.title && (
              <div className={styles.webPageTitle}>{renderText(webPageInfo.title)}</div>
            )}
          </div>
        )}
      </div>
      {hasMediaPreview && (
        <div
          className={buildClassName(
            styles.mediaPreview,
            webPageInfo && styles.clickable,
          )}
          onClick={handleMediaClick}
          role={webPageInfo ? 'button' : undefined}
          tabIndex={webPageInfo ? 0 : undefined}
          title={webPageInfo?.url}
        >
          <img
            src={mediaBlobUrl || mediaThumbnail}
            alt=""
            className={buildClassName(
              styles.mediaImage,
              isRoundVideo && styles.round,
              isSpoiler && styles.spoiler,
            )}
            draggable={false}
          />
          {hasVideo && <i className={buildClassName(styles.playIcon, 'icon icon-play')} />}
        </div>
      )}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { message }): Complete<StateProps> => {
    return {
      webPage: selectWebPageFromMessage(global, message),
    };
  },
)(MiddleSearchResult));

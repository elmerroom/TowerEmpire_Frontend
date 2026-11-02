import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ChatInput } from './sub-components/chatInput';
import { useChatWS } from '@/store/contexts/ChatWebSocketProvider';
import {
  selectRoomChat,
  selectGameChat,
  selectResetChatCountersFlag,
} from '../../store/slices/lobby/lobbyUiSlice';
import { getUsername } from '@/entities/user/model/slice';
import base from './styles/base.module.scss';
import { CHAT_THEMES } from './styles';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Button } from '../../shared/ui/Button';

export const Chat = ({ type, iconSrc, icon }) => {
  const [isOpenedChat, setOpenChat] = useState(
    () => window.matchMedia('(min-width: 37.126em)').matches && type === 'ROOM',
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(0);

  // `s` - theme-specific styles (based on selected chat type)
  // `base` - shared/common styles used across all chat themes
  const s = CHAT_THEMES[type] || CHAT_THEMES.room;
  const containerClasses = [
    s.chatContainer,
    base.visible,
    isOpenedChat ? base.visible : base.hidden,
  ].join(' ');

  const currentUsername = useSelector(getUsername);

  const chatMessages = useSelector(
    type === 'ROOM' ? selectRoomChat : selectGameChat,
  );

  const resetCountersFlag = useSelector(selectResetChatCountersFlag);

  const chatRef = useRef();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setUnreadCount(0);
    setLastReadMessageIndex(chatMessages.length);
  }, [resetCountersFlag, chatMessages.length]);

  const ToggleChat = () => {
    setOpenChat(prev => !prev);
    if (!isOpenedChat) {
      setUnreadCount(0);
      setLastReadMessageIndex(chatMessages.length);
    }
  };

  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (!isOpenedChat && chatMessages.length > lastReadMessageIndex) {
      const newUnreadMessages = chatMessages
        .slice(lastReadMessageIndex)
        .filter(msg => msg.username !== currentUsername);

      setUnreadCount(newUnreadMessages.length);
    }
  }, [chatMessages, isOpenedChat, lastReadMessageIndex, currentUsername]);

  const { isOnline = true, sendMessage, setChatType } = useChatWS();

  useEffect(() => {
    setChatType(type);
  }, [type, setChatType]);

  const handleSend = message => {
    sendMessage(message, type);
  };

  const formatUnreadCount = count => {
    return count > 99 ? '99+' : count;
  };

  const useOutsideClick = (ref, callback) => {
    useEffect(() => {
      const handleClick = e => {
        if (
          (window.matchMedia('(max-width: 637px)').matches &&
            type === 'ROOM') ||
          type !== 'ROOM'
        ) {
          if (ref.current && !ref.current.contains(e.target)) {
            callback();
          }
        }
      };

      document.addEventListener('mousedown', handleClick);
      return () => {
        document.removeEventListener('mousedown', handleClick);
      };
    }, [ref, callback]);
  };

  useOutsideClick(chatContainerRef, () => {
    setOpenChat(false);

    setLastReadMessageIndex(chatMessages.length);
  });

  return (
    <>
      {!isOpenedChat && (
        <Button className={`${base.chatBtn} ${s.chatBtn}`} onClick={ToggleChat}>
          {icon ? (
            icon
          ) : iconSrc ? (
            <img src={iconSrc} alt="chat" className={base.chatImgIcon} />
          ) : (
            <svg className={`align-middle ${base.chatSVG}`}>
              <use
                className="align-middle"
                xlinkHref="/sprite.svg#message"
              ></use>
            </svg>
          )}
          {unreadCount > 0 && (
            <span className={base.chatNotificationBadge}>
              {formatUnreadCount(unreadCount)}
            </span>
          )}
        </Button>
      )}

      <div className={`col ${containerClasses}`} ref={chatContainerRef}>
        <Button
          className={`${base.closeButton} ${base.btnHover} ${s.closeButton}`}
          onClick={ToggleChat}
        >
          <svg className={`${base.closeButtonSVG} ${s.closeButtonSVG}`}>
            <use href="#close-chat-button"></use>
          </svg>
        </Button>

        <div className={s.upperContainer}>
          <span className={s.title}>ЧAT</span>
          <hr className={s.hrLine} size="5" />
        </div>

        <div className={s.innerContent}>
          <SimpleBar className={s.messages} ref={chatRef}>
            {chatMessages.map((message, index) => {
              const username = message?.user?.username || 'Anonymous';
              return (
                <p
                  key={index}
                  className={`text-break ${base.textBody} ${s.text}`}
                >
                  <span className={s.userName}>{username}:</span>{' '}
                  {message?.message}
                </p>
              );
            })}
          </SimpleBar>
        </div>
        <ChatInput
          handleSend={handleSend}
          isOnline={isOnline}
          type={type}
          styles={s}
          base={base}
        ></ChatInput>
      </div>
    </>
  );
};

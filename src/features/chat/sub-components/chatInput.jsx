import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import useUser from '../../../entities/user/model/hooks';
import { Button } from '../../../shared/ui/Button';

// Динамический импорт emoji picker
const EmojiPickerLazy = lazy(() =>
  Promise.all([
    import('@emoji-mart/data').then(m => m.default),
    import('@emoji-mart/react').then(m => m.default),
  ]).then(([data, Picker]) => {
    return {
      default: ({ onEmoji }) => (
        <Picker height="350px" data={data} onEmojiSelect={onEmoji} />
      ),
    };
  }),
);

export const ChatInput = ({ handleSend, type, styles, base }) => {
  const { isHost } = useUser();
  const pickerRef = useRef();
  const buttonRef = useRef();

  const addEmoji = e => {
    const sym = e.unified.split('_');
    const codeArray = [];
    sym.forEach(el => codeArray.push('0x' + el));
    let emoji = e.native;
    setInputValue(inputValue + emoji);
  };
  // Состояние для смайликов
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Если пользователь не хост, а сообщение начинается с '/cmd_', удаляем префикс.
  const processMessage = message => {
    if (!isHost() && message.startsWith('/cmd_')) {
      return message.slice(5); // удаляем первые 5 символов ('/cmd_')
    }
    return message;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!inputValue.trim()) return;
    const messageToSend = processMessage(inputValue);
    handleSend(messageToSend);
    setInputValue('');
    setIsOpen(false);
  };

  const onKeyDown = event => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      const messageToSend = processMessage(inputValue);
      handleSend(messageToSend);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const useOutsideClick = (ref, callback) => {
    useEffect(() => {
      const handleClick = e => {
        if (
          ref.current &&
          !ref.current.contains(e.target) &&
          !buttonRef.current.contains(e.target)
        ) {
          callback();
        }
      };

      document.addEventListener('mousedown', handleClick);
      return () => {
        document.removeEventListener('mousedown', handleClick);
      };
    }, [ref, callback]);
  };

  useOutsideClick(pickerRef, () => setIsOpen(false));

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`d-flex justify-content-between align-items-center gap-1 ${styles.chatInput}`}
      >
        <input
          className={base.textBody}
          type="text"
          name="inputValue"
          maxLength="340"
          placeholder="Написать сообщение..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div>
          <Button
            ref={buttonRef}
            className={base.btnHover}
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className={`${base.emojiFaceSVG} ${styles.emojiFaceSVG}`}>
              <use href="#chat-emoji-face"></use>
            </svg>
          </Button>
          {isOpen && (
            <div
              ref={pickerRef}
              className={base.pickerContainer}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%) translateY(-490px)',
              }}
            >
              <Suspense
                fallback={
                  <div style={{ padding: '10px', width: '350px' }}>
                    Загрузка эмодзи...
                  </div>
                }
              >
                <EmojiPickerLazy onEmoji={addEmoji} />
              </Suspense>
            </div>
          )}
        </div>

        <Button type="submit" className={base.btnHover}>
          <svg className={`${base.sendButtonSVG} ${styles.sendButtonSVG}`}>
            <use href="/sprite.svg#chat-send-button"></use>
          </svg>
        </Button>
      </div>
    </form>
  );
};

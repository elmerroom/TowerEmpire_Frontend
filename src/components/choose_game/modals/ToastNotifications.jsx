import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../../store/contexts/WsRootProvider';
import { Button } from '../../../shared/ui/Button';

export const ToastNotifications = () => {
  const { lastMessage } = useWebSocket();
  const [notifications, setNotifications] = useState([]);
  const username = useSelector(state => state.user.username);
  const { id } = useParams();
  const emoji = { in: '🐱', out: '🐾', host: '👑' };

  // Ref для хранения последнего обработанного сообщения
  const lastProcessedMessage = useRef(null);

  // Функция для добавления уведомления
  const addNotification = (message, type) => {
    setNotifications(prev => [
      ...prev,
      {
        message,
        type,
      },
    ]);
  };

  const isDuplicateMessage = useCallback(() => {
    // Проверка дублирования для разных типов событий
    if (lastProcessedMessage.current?.event === lastMessage.event) {
      if (
        lastMessage.event === 'user_leave' ||
        lastMessage.event === 'user_join' ||
        lastMessage.event === 'start_game'
      ) {
        // Проверяем только по user.id
        return lastProcessedMessage.current?.user?.id === lastMessage.user?.id;
      } else if (lastMessage.event === 'change_host') {
        // Проверяем только по new_host_id
        return (
          lastProcessedMessage.current?.new_host_id === lastMessage.new_host_id
        );
      }
    }
    return false;
  }, [lastMessage]);

  useEffect(() => {
    if (lastMessage) {
      // Если сообщение является дубликатом, выходим из эффекта
      if (isDuplicateMessage()) {
        return;
      }

      lastProcessedMessage.current = lastMessage;

      const isCurrentUser = lastMessage.user?.username === username;

      switch (lastMessage.event) {
        case 'user_join':
          addNotification(
            isCurrentUser
              ? `${emoji.in} Вы вошли в комнату ${id}`
              : `${emoji.in} Игрок ${lastMessage.user.username} вошел в комнату`,
            'success',
          );
          break;

        case 'user_leave':
          addNotification(
            `${emoji.out} Игрок id ${lastMessage.user.id} вышел из комнаты`,
            'dark',
          );
          break;
        case 'change_host':
          addNotification(
            `${emoji.host} Права хоста переданы игроку ${lastMessage.new_host_id}`,
            'info',
          );
          break;
        case 'change_max_players':
          console.log(
            'максимальное количество игроков  изменено на:',
            lastMessage.new_max_players,
          );
          break;
        case 'change_settings':
          addNotification('Новые настройки применены', 'success');
          break;
        case 'start_game':
          addNotification(`${emoji.in} Вы в игре`, 'info');
          break;
        case 'start_round':
          console.log('Новый раунд', 'success');
          break;
        case 'pause_game':
          console.log('Игра поставлена на паузу', 'dark');
          break;
        case 'resume_game':
          console.log('Игра продолжается', 'success');
          break;
        case 'end_phase_master_choice':
          addNotification(`Ответ победителя ${lastMessage.text}`, 'success');
          break;
        case 'show_selected_cards':
          addNotification(
            `Выбранные карты:${lastMessage.cards.map(card => card.text)}`,
            'success',
          );
          break;
        case 'next_round':
          console.log('Готов!?', 'success');
          break;
        case 'finish_game':
          addNotification('Игра окончена', 'warning');
          break;
        case 'exit_all_from_game':
          console.log('exit_all_from_game');
          break;
        case 'end_phase_player_choice_card':
          console.log('end_phase_player_choice_card');
          break;
        default:
          console.warn(`Неизвестное событие: ${lastMessage.event}`);
      }
    }
  }, [
    lastMessage,
    username,
    id,
    isDuplicateMessage,
    emoji.in,
    emoji.out,
    emoji.host,
  ]);

  const removeNotification = index => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // Удаляем уведомление через 3 секунды
  useEffect(() => {
    if (notifications.length) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return createPortal(
    <div
      id="toasts"
      className="position-fixed w-25 bottom-0 end-0 p-3"
      style={{ zIndex: 1050 }}
    >
      {notifications.map((notif, index) => (
        <div
          key={index}
          className={`toast show  mb-2 text-white bg-${notif.type} border-0`}
        >
          <div className="d-flex ">
            <div className="toast-body">{notif.message}</div>
            <Button
              className="toast-close-btn"
              onClick={() => removeNotification(index)}
              aria-label="Закрыть"
            >
              <svg>
                <use href="#close" />
              </svg>
            </Button>
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
};

// Утилита для сохранения и получения порядка входа игроков
const PLAYER_ORDER_KEY = 'player_order';

// Получить порядок входа игроков из localStorage
export const getPlayerOrder = roomId => {
  try {
    const orderData = localStorage.getItem(`${PLAYER_ORDER_KEY}_${roomId}`);
    return orderData ? JSON.parse(orderData) : {};
  } catch (e) {
    console.error('Error getting player order from localStorage:', e);
    return {};
  }
};

// Сохранить время входа игрока
export const savePlayerJoinTime = (roomId, playerId, timestamp) => {
  try {
    const orderData = getPlayerOrder(roomId);
    // Сохраняем время входа только если его еще нет
    if (!orderData[playerId]) {
      orderData[playerId] = timestamp;
      localStorage.setItem(
        `${PLAYER_ORDER_KEY}_${roomId}`,
        JSON.stringify(orderData),
      );
    }
    return orderData;
  } catch (e) {
    console.error('Error saving player order to localStorage:', e);
    return {};
  }
};

// Получить время входа для конкретного игрока
export const getPlayerJoinTime = (roomId, playerId) => {
  const orderData = getPlayerOrder(roomId);
  return orderData[playerId] || null;
};

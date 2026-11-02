/* eslint-disable react-refresh/only-export-components */
import * as bootstrap from 'bootstrap';

export const escapeHtml = text => {
  if (typeof text !== 'string') return text;
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
};

export function generateRandomUsername() {
  const randomNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `user_${randomNumber}`;
}

// export function () {
//   const cookies = document.cookie.split(';');

//   cookies.forEach(cookie => {
//     const [name, _] = cookie.split('=');
//     document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
//   });
// }

export const AvatarLetter = username => {
  return username?.charAt(0).toUpperCase();
};

export const handleClose = id => {
  const button = document.getElementById(id);
  button.click();
};
export const handleOpen = id => {
  const modalElement = document.getElementById(id);
  const myModal = new bootstrap.Modal(modalElement);

  // Добавляем обработчик события для полного закрытия модального окна
  modalElement.addEventListener(
    'hidden.bs.modal',
    () => {
      // Удаляет оверлей
      const modalBackdrops = document.querySelectorAll('.modal-backdrop');
      modalBackdrops.forEach(backdrop => {
        backdrop.remove();
      });
    },
    { once: true },
  );

  myModal.show();
};

export function validatePassword(password) {
  const lengthCheck = /^.{8,15}$/;
  const uppercaseCheck = /[A-Z]/;
  const lowercaseCheck = /[a-z]/;
  const digitCheck = /[0-9]/;
  const alphanumericCheck = /^[A-Za-z0-9]+$/;
  const spaceCheck = /^\S*$/;

  if (
    lengthCheck.test(password) &&
    uppercaseCheck.test(password) &&
    lowercaseCheck.test(password) &&
    digitCheck.test(password) &&
    alphanumericCheck.test(password) &&
    spaceCheck.test(password)
  ) {
    return true;
  } else {
    return false;
  }
}
// Валидация: только латинские буквы и цифры, без пробелов, 3-10 символов
export function isLatinAndDigits(str) {
  return /^[A-Za-z0-9]+$/.test(str);
}

export function validateUsername(username) {
  const trimmedUsername = username.trim();

  if (!trimmedUsername || trimmedUsername.length === 0) {
    return false;
  }

  if (trimmedUsername.length < 3 || trimmedUsername.length > 15) {
    return false;
  }

  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9 !@#$%^&*()_+[\]{};':"\\|,.<>/?-]*$/;

  if (nameRegex.test(trimmedUsername)) {
    return true;
  } else {
    return false;
  }
}

export const handleEnterKey = (modal, button) => {
  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById(button).click();
    }
  };
  const addEventListeners = () => {
    modal?.addEventListener('keydown', handleKeyDown);
  };

  const removeEventListeners = () => {
    modal?.removeEventListener('keydown', handleKeyDown);
  };

  if (modal) {
    modal.addEventListener('show.bs.modal', addEventListeners);
    modal.addEventListener('hide.bs.modal', removeEventListeners);
  }

  return () => {
    if (modal) {
      modal.removeEventListener('show.bs.modal', addEventListeners);
      modal.removeEventListener('hide.bs.modal', removeEventListeners);
      removeEventListeners();
    }
  };
};

//декодируем токен для получения id текущего пользователя
export function getCurrentUserId(token) {
  if (!token) {
    console.warn('Токен не предоставлен.');
    return null;
  }
  try {
    const tokenParts = token.split('.');
    const tokenPayload = JSON.parse(atob(tokenParts[1]));
    return tokenPayload.user_id;
  } catch (error) {
    console.error('Не удалось декодировать токен:', error);
    return null;
  }
}

export const countAnswers = question => {
  const blankPattern = /___/g;
  const matches = question.match(blankPattern);
  return matches ? matches.length : 0;
};

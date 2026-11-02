import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './input.scss';
/**
 * Универсальный компонент ввода (Input).
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} [props.type='text'] - Тип поля ввода (text, password, email и др.).
 * @param {string} [props.label] - Текст метки (`label`) для поля.
 * @param {string} [props.placeholder] - Текст placeholder
 * @param {string} [props.id] - Уникальный идентификатор для связывания `label` с `input`.
 * @param {string} [props.value] - Значение поля ввода.
 * @param {function} [props.onChange] - Обработчик события изменения значения (`onChange`).
 * @param {string} [props.error] - Текст ошибки (если есть).
 * @param {number} [props.maxLength] - Максимальная длина вводимого значения.
 * @param {Object} [props.props] - Дополнительные свойства, передаваемые в `input`.
 * @returns {JSX.Element} Компонент `Input`.
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutRef.current);
  }, [value, delay]);

  return debouncedValue;
};

export const Input = ({
  type = 'text',
  label,
  placeholder,
  id,
  value,
  onChange,
  error,
  maxLength,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [hasShake, setHasShake] = useState(false);
  const debouncedError = useDebounce(error, 500);
  const inputId = id || `input-${type}`;
  const isFirstErrorInCycle = useRef(true);
  const inputType = type === 'password' ? (show ? 'text' : 'password') : type;
  const togglePasswordVisibility = () => {
    setShow(prev => !prev);
  };
  // Основная логика обработки ошибок
  useEffect(() => {
    if (debouncedError) {
      setIsErrorVisible(true);
      if (isFirstErrorInCycle.current) {
        setHasShake(true);
        isFirstErrorInCycle.current = false;
      }
    } else {
      setIsErrorVisible(false);
      isFirstErrorInCycle.current = true;
    }
  }, [debouncedError]);

  // Сброс анимации тряски
  useEffect(() => {
    if (hasShake) {
      const timer = setTimeout(() => setHasShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [hasShake]);

  const handleChange = e => {
    onChange(e);
    // Мгновенно скрываем ошибку при изменении поля
    if (error) {
      setIsErrorVisible(false);
    }
  };
  return (
    <div className="input-container">
      {label && (
        <label htmlFor={inputId} className="form-label text-color-blue">
          {label}
        </label>
      )}

      <div className="input-wrapper">
        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder || `Enter your ${type}`}
          maxLength={maxLength}
          className={`form-control ${error ? 'form-control_error' : ''} ${hasShake ? 'shake' : ''}`}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {type === 'password' && (
          <FontAwesomeIcon
            icon={show ? faEye : faEyeSlash}
            className="password-toggle"
            onClick={togglePasswordVisibility}
          />
        )}
        <div
          className={`error-message_input ${isErrorVisible ? 'visible' : ''}`}
        >
          {debouncedError}
        </div>
      </div>
    </div>
  );
};

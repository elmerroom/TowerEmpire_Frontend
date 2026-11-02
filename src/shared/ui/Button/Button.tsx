import React from 'react';

type ButtonVariant =
  | 'primary'
  | 'submit'
  | 'outline'
  | 'lobby'
  | 'back'
  | 'ashy'
  | 'confirm';

type ButtonTheme = 'default' | 'game' | 'fufl' | 'hff';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  theme?: ButtonTheme;
  children?: React.ReactNode;
}

const buildClassName = (
  variant: ButtonVariant,
  theme: ButtonTheme,
  extra?: string,
): string => {
  const parts: string[] = [];

  switch (variant) {
    case 'primary':
      break;

    case 'submit':
      parts.push('btn-submit');
      break;

    case 'outline':
      if (theme === 'game') parts.push('gameBtn', 'btn-outline');
      else if (theme === 'fufl') parts.push('fuflBtn', 'btn-outline');
      else if (theme === 'hff') parts.push('hffBtn', 'btn-outline');
      else parts.push('btn-outline');
      break;

    case 'confirm':
      if (theme === 'game') parts.push('gameBtn', 'gameBtn__confirm');
      else if (theme === 'fufl') parts.push('fuflBtn', 'fuflBtn__confirm');
      else if (theme === 'hff') parts.push('hffBtn', 'hffBtn__confirm');
      else parts.push('btn-submit');
      break;

    case 'lobby':
      parts.push('btn-lobby');
      break;

    case 'back':
      parts.push('btn-back');
      break;

    case 'ashy':
      parts.push('btn-ashy');
      break;
  }

  if (extra) parts.push(extra);
  return parts.join(' ');
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      theme = 'default',
      className,
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const computedClass = buildClassName(variant, theme, className);

    return (
      <button
        ref={ref}
        type={type}
        className={computedClass || undefined}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

import React from 'react';
import { IconProps } from '@/shared/types/icons';

export const LockIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fill={color}
        d="M17 9V7a5 5 0 0 0-10 0v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2Zm-8 0V7a3 3 0 0 1 6 0v2H9Zm3 4a2 2 0 0 1 2 2c0 .74-.402 1.387-1 1.732V18a1 1 0 1 1-2 0v-1.268A1.999 1.999 0 0 1 12 13Z"
      />
    </svg>
  );
};

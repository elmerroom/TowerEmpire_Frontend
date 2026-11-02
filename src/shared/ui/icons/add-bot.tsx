import React from 'react';
import { IconProps } from '@/shared/types';

export const AddBotIcon: React.FC<IconProps> = ({
  size = 12,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={(size * 15) / 12}
      height={size}
      viewBox="0 0 15 12"
      fill="none"
    >
      <path
        d="M7.5 3.25V0.5H4.7M0.5 7.375H1.9M13.1 7.375H14.5M9.6 6.6875V8.0625M5.4 6.6875V8.0625M3.3 3.25H11.7C12.4732 3.25 13.1 3.86561 13.1 4.625V10.125C13.1 10.8844 12.4732 11.5 11.7 11.5H3.3C2.5268 11.5 1.9 10.8844 1.9 10.125V4.625C1.9 3.86561 2.5268 3.25 3.3 3.25Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

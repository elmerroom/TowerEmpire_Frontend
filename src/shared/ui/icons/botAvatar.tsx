import { IconProps } from '@/shared/types';

export const BotAvatar: React.FC<IconProps> = ({
  color = '#102430',
  size = 35,
  className = '',
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill={color ? 'none' : '#adb3b8'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 9.25V4.5H9.2M2 16.375H4.4M23.6 16.375H26M17.6 15.1875V17.5625M10.4 15.1875V17.5625M6.8 9.25H21.2C22.5255 9.25 23.6 10.3133 23.6 11.625V21.125C23.6 22.4367 22.5255 23.5 21.2 23.5H6.8C5.47452 23.5 4.4 22.4367 4.4 21.125V11.625C4.4 10.3133 5.47452 9.25 6.8 9.25Z"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

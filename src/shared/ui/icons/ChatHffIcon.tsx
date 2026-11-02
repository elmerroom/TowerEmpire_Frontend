import React from 'react';

interface ChatHffIconProps {
  className?: string;
  size?: number;
}

export const ChatHffIcon: React.FC<ChatHffIconProps> = ({
  className = '',
  size = 58,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 58 58"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g filter="url(#chat_hff_filter0)">
      <g filter="url(#chat_hff_filter1)">
        <circle cx="29" cy="29" r="25" fill="#3B2C11" />
      </g>
      <circle cx="29" cy="29" r="24" stroke="#FFE6C2" strokeWidth="2" />
      <path
        d="M41.3055 20.0082C41.1891 19.9973 41.0717 19.9973 40.9552 20.0082H17.0297C16.8763 20.0104 16.724 20.0313 16.5768 20.0705L28.9241 31.2832L41.3055 20.0082Z"
        fill="#FFE6C2"
      />
      <path
        d="M42.571 21.0905L30.1297 32.3889C29.8095 32.6792 29.3764 32.8421 28.9249 32.8421C28.4734 32.8421 28.0403 32.6792 27.7201 32.3889L15.3899 21.1763C15.352 21.3033 15.3319 21.4342 15.3301 21.5659V37.1498C15.3301 37.5631 15.5101 37.9595 15.8306 38.2518C16.1511 38.544 16.5858 38.7082 17.039 38.7082H40.9646C41.4178 38.7082 41.8525 38.544 42.173 38.2518C42.4935 37.9595 42.6735 37.5631 42.6735 37.1498V21.5659C42.6667 21.4035 42.6321 21.2431 42.571 21.0905ZM18.2097 37.1498H17.022V36.0356L23.234 30.4175L24.4389 31.5162L18.2097 37.1498ZM40.9475 37.1498H39.7512L33.522 31.5162L34.7268 30.4175L40.9389 36.0356L40.9475 37.1498Z"
        fill="#FFE6C2"
      />
    </g>
    <defs>
      <filter
        id="chat_hff_filter0"
        x="0"
        y="0"
        width="58"
        height="64"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow"
          result="shape"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="10" />
        <feGaussianBlur stdDeviation="6" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
        />
        <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
      </filter>
      <filter
        id="chat_hff_filter1"
        x="4"
        y="4"
        width="50"
        height="60"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="10" />
        <feGaussianBlur stdDeviation="6" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"
        />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
      </filter>
    </defs>
  </svg>
);

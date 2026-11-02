import React, { lazy, Suspense } from 'react';

// Динамический импорт emoji-mart
const Picker = lazy(() =>
  import('@emoji-mart/react').then(m => ({ default: m.default })),
);
const emojiDataPromise = import('@emoji-mart/data').then(m => m.default);

export const EmojiPickerLazy = ({ onSelect, isOpen }) => {
  if (!isOpen) return null;

  return (
    <Suspense
      fallback={<div style={{ padding: '10px' }}>Loading emojis...</div>}
    >
      <PickerContent onSelect={onSelect} />
    </Suspense>
  );
};

const PickerContent = ({ onSelect }) => {
  const [emojiData, setEmojiData] = React.useState(null);

  React.useEffect(() => {
    emojiDataPromise.then(data => setEmojiData(data));
  }, []);

  if (!emojiData) return <div>Loading emojis...</div>;

  return <Picker data={emojiData} onEmojiSelect={onSelect} />;
};

export default EmojiPickerLazy;

import { useState } from 'react';

export const useInviteLink = (lobbyId: string | number | null) => {
  const [isCopied, setIsCopied] = useState(false);

  const inviteUrl =
    lobbyId !== null ? `${window.location.origin}/invite/${lobbyId}` : '';

  const copyInviteLink = async () => {
    if (lobbyId === null) return;

    await navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return {
    inviteUrl,
    isCopied,
    copyInviteLink,
  };
};

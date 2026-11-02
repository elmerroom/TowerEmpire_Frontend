import { Button } from '@/shared/ui/Button';
import { useInviteLink } from '@/components/helpers/hooks/useInviteLink';

interface InviteLinkProps {
  lobbyId: string | number | null;
  theme?: 'game' | 'lobby' | 'fufl' | 'hff';
}

export const InviteLink = ({ lobbyId, theme }: InviteLinkProps) => {
  const { isCopied, copyInviteLink, inviteUrl } = useInviteLink(lobbyId);

  return (
    <div className="position-relative invite_wrapper">
      <label className="invite_label">Ссылка для приглашений:</label>
      <div className="invite_btn-wrapper">
        <input
          className="modal-invite-players__input invite_input"
          type="text"
          value={inviteUrl}
          readOnly
          style={{ flex: 1 }}
        />
        <Button className="invite-btn" onClick={copyInviteLink}>
          <svg style={{ height: '20px', width: '20px' }}>
            <use href={theme === 'hff' ? '#inviteBeige' : '#invite'}></use>
          </svg>
        </Button>
      </div>
      <div
        className={`invite_success ${isCopied ? 'visible' : 'hidden'} invite_success-text`}
      >
        Ссылка успешно скопирована!
      </div>
    </div>
  );
};

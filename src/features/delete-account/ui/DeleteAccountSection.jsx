import { DeleteAccountContent } from './DeleteAccountContent';
import { useDeleteAccount } from '../model/useDeleteAccount';

export const DeleteAccountSection = ({ onBack }) => {
  const { deleteAccount } = useDeleteAccount();

  const handleConfirm = async () => {
    await deleteAccount();
    onBack();
  };
  return (
    <div className="delete-account-section">
      <DeleteAccountContent onCancel={onBack} onConfirm={handleConfirm} />
    </div>
  );
};

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ModalSVG } from '../../../shared/svg/modal_svg';
import { UniversalModal } from '../../../shared/universal-modal/UniversalModal';

export const RoomDeletedModal = () => {
  const navigate = useNavigate();
  const modalContent = useSelector(state => state.modal);

  const isOpen = useSelector(state => !!state.modal.openModals['roomDeleted']);

  const handleClose = () => {
    navigate('/lobby');
  };

  return (
    <UniversalModal
      isOpen={isOpen}
      onClose={handleClose}
      closeable={false}
      showCloseButton={false}
      portalTarget="body"
    >
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="my-modal-title title-white">{modalContent.title}</h1>
      </div>
      <ModalSVG />
      <div className="error-message">{modalContent.text}</div>
    </UniversalModal>
  );
};

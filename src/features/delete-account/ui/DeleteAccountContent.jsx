import { ModalSVG } from '../../../shared/svg/modal_svg';
import { Button } from '../../../shared/ui/Button';

export const DeleteAccountContent = ({
  onCancel,
  onConfirm,
  title = 'Удалить аккаунт',
}) => {
  return (
    <>
      <div className="d-flex justify-content-center align-items-center">
        <h1 className="my-modal-title title-white">{title}</h1>
      </div>
      <ModalSVG />
      <div className="modal-game-exit__text mb-3 d-flex flex-column align-items-center">
        <p className="mb-3" style={{ textAlign: 'center' }}>
          Вы уверены, что хотите удалить аккаунт?
          <br />
          Восстановить его не удастся!
        </p>
        <img
          className="mb-4"
          src="/img/cat-leave.gif"
          width="150"
          alt="Sad cat"
        />
        <div className="modal-buttons">
          <Button variant="outline" aria-label="Закрыть" onClick={onCancel}>
            Назад
          </Button>
          <Button variant="confirm" onClick={onConfirm}>
            Удалить аккаунт
          </Button>
        </div>
      </div>
    </>
  );
};

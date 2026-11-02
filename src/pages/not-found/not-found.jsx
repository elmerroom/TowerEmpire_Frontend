import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutFlow } from '../../utils/logoutFlow';
import { useUser } from '../../entities/user/model/hooks';
import { Button } from '../../shared/ui/Button';
import './not-found.css';
export const NotFound = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isRegisteredUser } = useUser();
  return (
    <div className="container container_lobby container_lines">
      <img
        src="./img/border-decor.svg"
        className="border-decor border-decor_left"
        alt="BorderDecor"
      />
      <img
        src="./img/border-decor.svg"
        className="border-decor border-decor_right"
        alt="BorderDecor"
      />
      <div className="nf-wrapper">
        <div className="nf-left">
          <h1>
            Упс! <br /> <span>Страница не найдена...</span>
          </h1>
          <Button
            className="nf-button"
            onClick={() =>
              logoutFlow({
                isRegisteredUser: isRegisteredUser(),
                dispatch,
                navigate,
              })
            }
          >
            Перейти на главную
          </Button>
        </div>
        <img className="nf-image" src="./img/mascot.png" alt="none" />
      </div>
    </div>
  );
};

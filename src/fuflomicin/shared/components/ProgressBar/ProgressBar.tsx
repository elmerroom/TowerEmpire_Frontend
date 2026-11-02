import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useTimer } from '../../../../components/helpers/hooks/useTimer';
import { Buyer } from '@/fuflomicin/components/fufl/Buyer/Buyer';
import { Vacancy } from '../../../components/hff/Vacancy/Vacancy';
import commonStyles from './ProgressBar.module.scss';
import fuflStyles from './themes/fufl.module.scss';
import hffStyles from './themes/hff.module.scss';

export const ProgressBar = () => {
  const gameType = useSelector(
    (state: RootState) => state.gamePlayers?.gameType,
  );
  const gameStyles = gameType === 'fuf' ? fuflStyles : hffStyles;

  return (
    <div className={commonStyles.progressBarWrapper}>
      <div className={gameStyles.progressBarWrapperLeft}></div>
      <div className={`${commonStyles.progressBar} ${gameStyles.progressBar}`}>
        {gameType === 'fuf' ? <Buyer /> : <Vacancy />}
      </div>
      <div className={gameStyles.progressBarWrapperRight}></div>
    </div>
  );
};

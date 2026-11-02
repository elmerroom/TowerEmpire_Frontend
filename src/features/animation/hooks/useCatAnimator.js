import { useDispatch } from 'react-redux';
import { playAnimation } from '../model/animateSlice';

export const useCatAnimation = () => {
  const dispatch = useDispatch();

  return (key, probability = 1, withFlash = false) => {
    if (Math.random() <= probability) {
      dispatch(playAnimation({ key, withFlash }));
    }
  };
};

import { useContext } from 'react';
import { WarningContext } from '../warningContext/WarningContext';

export const useWarning = () => useContext(WarningContext);

export default useWarning;

export { default as warningsReducer } from './slice/warningsSlice';
export { WarningModal } from './ui/WarningModal';
export { WarningProvider } from './warningContext/WarningContext';
export { useWarning } from './hooks/useWarning';
export { useWarn } from './hooks/useWarn';
export * from './slice/warningsSlice'; //экспорт всех экшенов и селекторов из слайса

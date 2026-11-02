export const audioSettingsMiddleware = store => next => action => {
  const result = next(action);

  const state = store.getState();
  const audioSettings = state.audioSettings;

  localStorage.setItem('audioSettings', JSON.stringify(audioSettings));

  return result;
};

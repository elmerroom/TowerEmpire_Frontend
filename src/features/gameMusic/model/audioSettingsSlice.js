import { createSlice } from '@reduxjs/toolkit';

const getInitialAudioSettings = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('audioSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.warn('Ошибка при чтении audioSettings из localStorage');
      }
    }
  }

  return {
    isMusicEnabled: true,
    musicVolume: 0.05,
    isSoundsEnabled: true,
    soundsVolume: 0.2,
  };
};

const initialState = getInitialAudioSettings();

const audioSettingsSlice = createSlice({
  name: 'audioSettings',
  initialState,
  reducers: {
    toggleMusic: state => {
      state.isMusicEnabled = !state.isMusicEnabled;
    },
    setMusicVolume: (state, action) => {
      state.musicVolume = action.payload;
    },
    toggleSounds: state => {
      state.isSoundsEnabled = !state.isSoundsEnabled;
    },
    setSoundsVolume: (state, action) => {
      state.soundsVolume = action.payload;
    },
  },
});

export const { toggleMusic, setMusicVolume, toggleSounds, setSoundsVolume } =
  audioSettingsSlice.actions;

export const selectIsMusicEnabled = state => state.audioSettings.isMusicEnabled;
export const selectMusicVolume = state => state.audioSettings.musicVolume;
export const selectIsSoundsEnabled = state =>
  state.audioSettings.isSoundsEnabled;
export const selectSoundsVolume = state => state.audioSettings.soundsVolume;

export default audioSettingsSlice.reducer;

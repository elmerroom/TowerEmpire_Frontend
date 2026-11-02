import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: '',
  text: '',
  redirectPath: '',
  theme: '',
};

const warningsSlice = createSlice({
  name: 'warnings',
  initialState,
  reducers: {
    showWarning: (state, action) => {
      state.title = action.payload.title;
      state.text = action.payload.text;
      state.redirectPath = action.payload.redirectPath;
      state.theme = action.payload.theme || '';
    },
    clearWarning: () => initialState,
  },
});
export const getWarningTitle = state => state.warnings.title;
export const getWarningText = state => state.warnings.text;
export const getWarningRedirectPath = state => state.warnings.redirectPath;
export const getWarningTheme = state => state.warnings.theme;
export const { showWarning, clearWarning } = warningsSlice.actions;
export default warningsSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { catAnimations } from '../const/animation';

const initialState = {
  currentAnimation: catAnimations.master,
  nextAnimationKey: null,
  isFlashing: false,
};

const animateSlice = createSlice({
  name: 'animate',
  initialState,
  reducers: {
    playAnimation(state, action) {
      const { key, withFlash = false } = action.payload;

      if (withFlash) {
        state.isFlashing = true;
        state.nextAnimationKey = key;
      } else {
        state.currentAnimation = catAnimations[key] || state.currentAnimation;
      }
    },
    flashEnded(state) {
      if (state.nextAnimationKey) {
        state.currentAnimation =
          catAnimations[state.nextAnimationKey] || state.currentAnimation;
      }
      state.isFlashing = false;
      state.nextAnimationKey = null;
    },
    resetAnimation(state) {
      state.currentAnimation = catAnimations.master;
      state.nextAnimationKey = null;
      state.isFlashing = false;
    },
  },
});

export const { playAnimation, flashEnded, resetAnimation } =
  animateSlice.actions;
export default animateSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from '../features/session/sessionSlice';
import roomReducer from '../features/room/roomSlice';

export const store = configureStore({
  reducer: { session: sessionReducer, room: roomReducer },
});

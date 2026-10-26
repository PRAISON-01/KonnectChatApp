import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const KEY = 'konnect_token';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* ignore */ } };

// Reuse the saved token, or ask the backend for a new one.
export const ensureSession = createAsyncThunk('session/ensure', async (_, { rejectWithValue }) => {
  const saved = read();
  if (saved) return saved;
  try {
    const data = await api.createSession();
    // Adjust if your CreateSessionResponse uses a different field name.
    const token = data?.token ?? data?.clientToken ?? data?.sessionToken;
    if (!token) throw new Error('The server did not return a client token.');
    write(token);
    return token;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const sessionSlice = createSlice({
  name: 'session',
  initialState: { token: null, status: 'loading', error: null },
  reducers: {
    resetSession(state) { write(null); state.token = null; state.status = 'idle'; },
  },
  extraReducers: (b) => {
    b.addCase(ensureSession.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(ensureSession.fulfilled, (s, { payload }) => { s.token = payload; s.status = 'ready'; })
      .addCase(ensureSession.rejected, (s, { payload }) => { s.status = 'error'; s.error = payload || 'Could not start a session.'; });
  },
});

export const { resetSession } = sessionSlice.actions;
export default sessionSlice.reducer;

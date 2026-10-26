import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const createRoom = createAsyncThunk('room/create', async (_, { rejectWithValue }) => {
  try {
    const data = await api.createRoom();
    // Adjust if your CreateRoomResponse uses a different field name.
    const code = data?.roomCode ?? data?.code;
    if (!code) throw new Error('The server did not return a room code.');
    return code;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const joinRoom = createAsyncThunk('room/join', async (code, { rejectWithValue }) => {
  try {
    await api.getRoom(code);
    return code;
  } catch (e) {
    return rejectWithValue(e.message.startsWith('Request failed (404')
      ? 'No room found with that code.' : e.message);
  }
});

export const fetchMessages = createAsyncThunk('room/fetchMessages', async (_, { getState, rejectWithValue }) => {
  const { room, session } = getState();
  try {
    return await api.getMessages(room.code, session.token);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const sendMessage = createAsyncThunk('room/send', async (content, { getState, rejectWithValue }) => {
  const { room, session } = getState();
  try {
    return await api.sendMessage(room.code, content, session.token);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

// Only the sender can delete a message: the server checks the token against the one that sent it.
export const deleteMessage = createAsyncThunk('room/deleteMessage', async (id, { getState, rejectWithValue }) => {
  const { room, session } = getState();
  try {
    await api.deleteMessage(room.code, id, session.token);
    return id;
  } catch (e) {
    if (e.status === 404) return id; // already gone, which is what the user wanted
    return rejectWithValue(e.message);
  }
});

const roomSlice = createSlice({
  name: 'room',
  initialState: { code: null, messages: [], status: 'idle', error: null },
  reducers: {
    leaveRoom: () => ({ code: null, messages: [], status: 'idle', error: null }),
    clearError(state) { state.error = null; },
  },
  extraReducers: (b) => {
    const start = (s) => { s.status = 'loading'; s.error = null; };
    const enter = (s, { payload }) => { s.status = 'idle'; s.code = payload; s.messages = []; };
    const fail = (s, { payload }) => { s.status = 'idle'; s.error = payload || 'Something went wrong.'; };

    b.addCase(createRoom.pending, start).addCase(createRoom.fulfilled, enter).addCase(createRoom.rejected, fail)
      .addCase(joinRoom.pending, start).addCase(joinRoom.fulfilled, enter).addCase(joinRoom.rejected, fail)
      .addCase(fetchMessages.fulfilled, (s, { payload }) => {
        // The backend returns newest first; show oldest first.
        s.messages = [...(payload || [])].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt) || a.id - b.id
        );
        s.error = null;
      })
      .addCase(fetchMessages.rejected, (s, { payload }) => { s.error = payload || 'Could not load messages.'; })
      .addCase(sendMessage.fulfilled, (s, { payload }) => {
        if (payload && !s.messages.some((m) => m.id === payload.id)) s.messages.push(payload);
        s.error = null;
      })
      .addCase(sendMessage.rejected, (s, { payload }) => { s.error = payload || 'Message not sent.'; })
      .addCase(deleteMessage.fulfilled, (s, { payload }) => {
        s.messages = s.messages.filter((m) => m.id !== payload);
        s.error = null;
      })
      .addCase(deleteMessage.rejected, (s, { payload }) => { s.error = payload || "Couldn't delete that message."; });
  },
});

export const { leaveRoom, clearError } = roomSlice.actions;
export default roomSlice.reducer;

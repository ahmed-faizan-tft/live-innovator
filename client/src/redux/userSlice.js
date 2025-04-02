import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user:{},
  selectedElement:"",
  lockedElement:[]
};

const userSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setSelectedElement: (state, action) => {
      state.selectedElement = action.payload;
    },
    setLockedElement: (state, action) => {
      state.lockedElement = action.payload;
    }
  },
});

export const { setUser, setSelectedElement, setLockedElement } = userSlice.actions;
export default userSlice.reducer;

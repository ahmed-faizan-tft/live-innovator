import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user:{},
  selectedElement:"",
  lockedElement:[],
  selectedTemplate:{}
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
    },
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    }
  },
});

export const { setUser, setSelectedElement, setLockedElement,setSelectedTemplate } = userSlice.actions;
export default userSlice.reducer;

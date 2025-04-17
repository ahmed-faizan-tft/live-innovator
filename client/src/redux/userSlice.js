import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user:{},
  selectedElement:"",
  lockedElement:[],
  selectedTemplate:{},
  stages:[],
  stagePosts:{},
  activeStage:"",
  currentStage:"",
  isStageBlocked:false,
  selectedPostsForNextStage: [],
  finalizeStage: "finalizeStage",
  comments: {},
  notificationTitle: "",
  deckElements:[],
  prioritiesStagePosts:{},
  prioritiesStagePostsEachUser:{}
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
    },
    setStages: (state, action) => {
      state.stages = action.payload;
    },
    setStagePost: (state, action) => {
      state.stagePosts = action.payload;
    },
    setActiveStage: (state, action) => {
      state.activeStage = action.payload;
    },
    setCurrentStage: (state, action) => {
      state.currentStage = action.payload;
    },
    setIsStageBlocked: (state, action) => {
      state.isStageBlocked = action.payload;
    },
    setSelectedPostsForNextStage: (state, action) => {
      state.selectedPostsForNextStage = action.payload
    },
    setFinalizeStage: (state, action) => {
      state.finalizeStage = action.payload
    },
    setComments: (state, action) => {
      state.comments = action.payload
    },
    setNotificationTitle: (state, action) => {
      state.notificationTitle = action.payload
    },
    setDeckElements: (state, action) => {
      state.deckElements = action.payload
    },
    setPrioritiesStagePosts: (state, action) => {
      state.prioritiesStagePosts = action.payload
    },

    setPrioritiesStagePostsEachUser: (state, action) => {
      state.prioritiesStagePostsEachUser = action.payload
    }
  },
});

export const { 
  setUser, 
  setSelectedElement, 
  setLockedElement,
  setSelectedTemplate, 
  setStages, 
  setStagePost,
  setActiveStage,
  setCurrentStage,
  setIsStageBlocked,
  setSelectedPostsForNextStage,
  setFinalizeStage,
  setComments,
  setNotificationTitle,
  setDeckElements,
  setPrioritiesStagePosts,
  setPrioritiesStagePostsEachUser 
} = userSlice.actions;
export default userSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import userStateReducer from "./States/users";

export let store = configureStore({
  reducer: {
    user: userStateReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

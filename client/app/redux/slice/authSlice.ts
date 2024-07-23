import { createSlice } from "@reduxjs/toolkit";
import { loginApi } from "../api/loginApi";

const initialState = {
    user: (String || Number),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addMatcher(
            loginApi.endpoints.adminLogin.matchFulfilled,
            (state, { payload }) => {
                state.user = payload;
            }
        );
    },
});

export default authSlice.reducer;
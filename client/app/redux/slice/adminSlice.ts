import { createSlice } from "@reduxjs/toolkit";
import { loginApi } from "../api/loginApi";
import { adminApi } from "../api/AdminApi";

const initialState = {
    adminData: (String || Number),
};

const adminSlice = createSlice({
    name: "adminSlice",
    initialState: { adminData: null },
    reducers: {
        updateAdminData: (state, { payload }) => {
            state.adminData = payload
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            adminApi.endpoints.getAdmin.matchFulfilled,
            (state, { payload }) => {
                state.adminData = payload;
            }
        );
    },
});
export const { updateAdminData } = adminSlice.actions
export default adminSlice.reducer;
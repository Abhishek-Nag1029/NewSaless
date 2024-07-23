import { createSlice } from "@reduxjs/toolkit";
import { loginApi } from "../api/loginApi";
import { employeeApi } from "../api/EmployeeApi";

const initialState = {
    empData: (String || Number),
};

const empSlice = createSlice({
    name: "empSlice",
    initialState: { empData: null },
    reducers: {
        empData: (state, { payload }) => {
            state.empData = payload
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            employeeApi.endpoints.getEmployee.matchFulfilled,
            (state, { payload }) => {
                state.empData = payload;
            }
        );
    },
});
export const { empData } = empSlice.actions
export default empSlice.reducer;
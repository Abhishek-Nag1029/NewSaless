import { createSlice } from "@reduxjs/toolkit";
import { candidateApi } from "../api/CandidateApi";


const initialState = {
    candidateData: (String || Number),
};

const candidateSlice = createSlice({
    name: "candidateSlice",
    initialState: { candidateData: null },
    reducers: {
        candidateData: (state, { payload }) => {
            state.candidateData = payload
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            candidateApi.endpoints.getCandidate.matchFulfilled,
            (state, { payload }) => {
                state.candidateData = payload;
            }
        );
    },
});
export const { candidateData } = candidateSlice.actions
export default candidateSlice.reducer;
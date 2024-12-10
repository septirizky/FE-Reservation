import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const BRANCH_CATEGORY_URL = `${API}/branch_category`;

export const getBranchCategory = createAsyncThunk(
  "home/getBranchCategory",
  async () => {
    const response = await axios.get(BRANCH_CATEGORY_URL, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

const homeSlice = createSlice({
  name: "home",
  initialState: {
    branchCategories: [],
    getBranchCategoryStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBranchCategory.pending, (state) => {
        state.getBranchCategoryStatus = "loading";
      })
      .addCase(getBranchCategory.fulfilled, (state, action) => {
        state.getBranchCategoryStatus = "succeeded";
        state.branchCategories = action.payload;
      })
      .addCase(getBranchCategory.rejected, (state, action) => {
        state.getBranchCategoryStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default homeSlice.reducer;

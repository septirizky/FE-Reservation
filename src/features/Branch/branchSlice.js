import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const BRANCH_URL = `${API}/branch`;
const BRANCH_QUOTA_URL = `${API}/branch_quota`;

export const getBranch = createAsyncThunk(
  "branch/getBranch",
  async (ranchCategoryName) => {
    const response = await axios.get(`${BRANCH_URL}_all/${ranchCategoryName}`);
    return response.data.data;
  }
);

export const getBranchDetail = createAsyncThunk(
  "branch/getBranchDetail",
  async (BranchCode) => {
    const response = await axios.get(`${BRANCH_URL}/${BranchCode}`);
    return response.data.data;
  }
);

export const getBranchQuota = createAsyncThunk(
  "branch/getBranchQuota",
  async (BranchCode) => {
    const response = await axios.get(`${BRANCH_QUOTA_URL}/${BranchCode}`);
    return response.data.data;
  }
);

const branchSlice = createSlice({
  name: "branch",
  initialState: {
    branches: [],
    branchDetail: null,
    branchQuota: null,
    getBranchStatus: "idle",
    getBranchDetailStatus: "idle",
    getBranchQuotaStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getBranch.pending, (state) => {
        state.getBranchStatus = "loading";
      })
      .addCase(getBranch.fulfilled, (state, action) => {
        state.getBranchStatus = "succeeded";
        state.branches = action.payload;
      })
      .addCase(getBranch.rejected, (state, action) => {
        state.getBranchStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(getBranchDetail.pending, (state) => {
        state.getBranchDetailStatus = "loading";
      })
      .addCase(getBranchDetail.fulfilled, (state, action) => {
        state.getBranchDetailStatus = "succeeded";
        state.branchDetail = action.payload;
      })
      .addCase(getBranchDetail.rejected, (state, action) => {
        state.getBranchDetailStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(getBranchQuota.pending, (state) => {
        state.getBranchQuotaStatus = "loading";
      })
      .addCase(getBranchQuota.fulfilled, (state, action) => {
        state.getBranchQuotaStatus = "succeeded";
        state.branchQuota = action.payload;
      })
      .addCase(getBranchQuota.rejected, (state, action) => {
        state.getBranchQuotaStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default branchSlice.reducer;

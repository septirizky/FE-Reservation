import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const PACKAGE_URL = `${API}/item_package`;

export const getPackage = createAsyncThunk("package/getPackage", async () => {
  const response = await axios.get(PACKAGE_URL, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response.data.data;
});

const packageSlice = createSlice({
  name: "package",
  initialState: {
    packages: [],
    getPackageStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPackage.pending, (state) => {
        state.getPackageStatus = "loading";
      })
      .addCase(getPackage.fulfilled, (state, action) => {
        state.getPackageStatus = "succeeded";
        state.packages = action.payload;
      })
      .addCase(getPackage.rejected, (state, action) => {
        state.getPackageStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default packageSlice.reducer;

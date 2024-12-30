import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const CONFIG_URL = `${API}/config`;

export const getConfig = createAsyncThunk("config/getConfig", async () => {
  const response = await axios.get(CONFIG_URL);
  return response.data.data;
});

const configSlice = createSlice({
  name: "config",
  initialState: {
    config: [],
    getConfigStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getConfig.pending, (state) => {
        state.getConfigStatus = "loading";
      })
      .addCase(getConfig.fulfilled, (state, action) => {
        state.getConfigStatus = "succeeded";
        state.config = action.payload;
      })
      .addCase(getConfig.rejected, (state, action) => {
        state.getConfigStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default configSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

export const getOption = createAsyncThunk("option/getOption", async () => {
  const response = await axios.get(`${API}/item_option`);
  return response.data.data;
});

export const getOptionMenu = createAsyncThunk(
  "option/getOptionMenu",
  async (MenuId) => {
    const response = await axios.get(`${API}/option_menu/${MenuId}`);
    return response.data.data;
  }
);

export const getOptionCategory = createAsyncThunk(
  "option/getOptionCategory",
  async (CategoryId) => {
    const response = await axios.get(`${API}/option_category/${CategoryId}`);
    return response.data.data;
  }
);

const optionSlice = createSlice({
  name: "option",
  initialState: {
    optionMenu: [],
    optionCategory: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOptionMenu.fulfilled, (state, action) => {
        state.optionMenu = action.payload;
      })
      .addCase(getOptionCategory.fulfilled, (state, action) => {
        state.optionCategory = action.payload;
      });
  },
});

export default optionSlice.reducer;

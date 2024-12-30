import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const MENU_URL = `${API}/menu`;

export const getMenuBranch = createAsyncThunk(
  "menu/getMenuBranch",
  async (BranchCode) => {
    const response = await axios.get(`${MENU_URL}/${BranchCode}`);
    return response.data.data;
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    menuBranch: [],
    getMenuBranchStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMenuBranch.pending, (state) => {
        state.getMenuBranchStatus = "loading";
      })
      .addCase(getMenuBranch.fulfilled, (state, action) => {
        state.getMenuBranchStatus = "succeeded";
        state.menuBranch = action.payload;
      })
      .addCase(getMenuBranch.rejected, (state, action) => {
        state.getMenuBranchStatus = "failed";
        state.error = action.error.message;
      });
  },
});

// Selectors to get the data
export const selectAllMenus = (state) => state.menu.menus;
export const selectMenuBranch = (state) => state.menu.menuBranch;
export const selectMenuStatus = (state) => state.menu.getMenuStatus;
export const selectMenuBranchStatus = (state) => state.menu.getMenuBranchStatus;
export const selectMenuError = (state) => state.menu.error;

export default menuSlice.reducer;

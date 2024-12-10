import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const MENU_URL = `${API}/item_menu`;

export const getMenu = createAsyncThunk("menu/getMenu", async () => {
  const response = await axios.get(MENU_URL, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response.data.data;
});

export const getMenuBranch = createAsyncThunk(
  "menu/getMenuBranch",
  async (BranchCode) => {
    const response = await axios.get(`${MENU_URL}/${BranchCode}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    menus: [],
    menuBranch: [],
    getMenuStatus: "idle",
    getMenuBranchStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMenu.pending, (state) => {
        state.getMenuStatus = "loading";
      })
      .addCase(getMenu.fulfilled, (state, action) => {
        state.getMenuStatus = "succeeded";
        state.menus = action.payload;
      })
      .addCase(getMenu.rejected, (state, action) => {
        state.getMenuStatus = "failed";
        state.error = action.error.message;
      })
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

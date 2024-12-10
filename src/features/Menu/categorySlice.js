import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const CATEGORY_URL = `${API}/category_item_menu`;

export const getCategory = createAsyncThunk(
  "category/getCategory",
  async () => {
    const response = await axios.get(CATEGORY_URL, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

export const getCategoryBranch = createAsyncThunk(
  "category/getCategoryBranch",
  async (BranchCode) => {
    const response = await axios.get(`${CATEGORY_URL}/${BranchCode}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

export const uploadCategory = createAsyncThunk(
  "category/uploadCategory",
  async (data) => {
    const response = await axios.post(CATEGORY_URL, data, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    categoriesBranch: [],
    uploadCategoryStatus: "idle",
    getCategoryStatus: "idle",
    getCategoryBranchStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategory.pending, (state) => {
        state.getCategoryStatus = "loading";
      })
      .addCase(getCategory.fulfilled, (state, action) => {
        state.getCategoryStatus = "succeeded";
        state.categories = action.payload; // Simpan kategori ke state biasa
      })
      .addCase(getCategory.rejected, (state, action) => {
        state.getCategoryStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(getCategoryBranch.pending, (state) => {
        state.getCategoryBranchStatus = "loading";
      })
      .addCase(getCategoryBranch.fulfilled, (state, action) => {
        state.getCategoryBranchStatus = "succeeded";
        state.categoriesBranch = action.payload; // Simpan kategori cabang ke state biasa
      })
      .addCase(getCategoryBranch.rejected, (state, action) => {
        state.getCategoryBranchStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(uploadCategory.pending, (state) => {
        state.uploadCategoryStatus = "loading";
      })
      .addCase(uploadCategory.fulfilled, (state) => {
        state.uploadCategoryStatus = "succeeded";
      })
      .addCase(uploadCategory.rejected, (state, action) => {
        state.uploadCategoryStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectAllCategories = (state) => state.category.categories;
export const selectCategoryBranch = (state) => state.category.categoriesBranch;
export const selectCategoryStatus = (state) => state.category.getCategoryStatus;

export default categorySlice.reducer;

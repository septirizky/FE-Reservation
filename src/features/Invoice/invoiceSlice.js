import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const INVOICE_URL = `${API}/create_invoice`;

export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${INVOICE_URL}`, invoiceData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {
    invoiceResponse: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invoiceResponse = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default invoiceSlice.reducer;

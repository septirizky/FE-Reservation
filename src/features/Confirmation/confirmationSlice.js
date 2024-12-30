import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const RESERVATION_URL = `${API}/reservation`;

export const getReservationDetail = createAsyncThunk(
  "confirmation/getReservationDetail",
  async (reservationId) => {
    const response = await axios.get(`${RESERVATION_URL}/${reservationId}`);
    return response.data.data;
  }
);

export const updateTax = createAsyncThunk(
  "confirmation/updateTax",
  async ({ reservationId, updatedData }) => {
    const response = await axios.put(
      `${RESERVATION_URL}/${reservationId}`,
      updatedData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  }
);

const confirmationSlice = createSlice({
  name: "confirmation",
  initialState: {
    reservationDetail: null,
    getReservationDetailStatus: "idle",
    updateTaxStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReservationDetail.pending, (state) => {
        state.getReservationDetailStatus = "loading";
      })
      .addCase(getReservationDetail.fulfilled, (state, action) => {
        state.getReservationDetailStatus = "succeeded";
        state.reservationDetail = action.payload;
      })
      .addCase(getReservationDetail.rejected, (state, action) => {
        state.getReservationDetailStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(updateTax.pending, (state) => {
        state.updateTaxStatus = "loading";
      })
      .addCase(updateTax.fulfilled, (state, action) => {
        state.updateTaxStatus = "succeeded";
        if (
          state.reservationDetail &&
          state.reservationDetail.reservationId === action.payload.reservationId
        ) {
          state.reservationDetail.tax = action.payload.tax;
          state.reservationDetail.cookingCharge = action.payload.cookingCharge;
        }
      })
      .addCase(updateTax.rejected, (state, action) => {
        state.updateTaxStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default confirmationSlice.reducer;

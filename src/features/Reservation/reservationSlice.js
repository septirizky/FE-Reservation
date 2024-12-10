import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const RESERVATION_URL = `${API}/reservation`;

export const getReservation = createAsyncThunk(
  "reservation/getReservation",
  async () => {
    const response = await axios.get(RESERVATION_URL, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

export const getReservationBranch = createAsyncThunk(
  "reservation/getReservationBranch",
  async (BranchCode) => {
    const response = await axios.get(
      `${RESERVATION_URL}_branch/${BranchCode}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    return response.data.data;
  }
);

export const getReservationById = createAsyncThunk(
  "reservation/getReservationById",
  async (reservationId) => {
    const response = await axios.get(`${RESERVATION_URL}/${reservationId}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

export const createReservation = createAsyncThunk(
  "reservation/createReservation",
  async (reservationData) => {
    const response = await axios.post(RESERVATION_URL, reservationData, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data;
  }
);

export const updateReservation = createAsyncThunk(
  "reservation/updateReservation",
  async ({ reservationId, reservationData, orderData }) => {
    const response = await axios.put(
      `${RESERVATION_URL}/${reservationId}`,
      {
        ...reservationData,
        ...orderData,
      },
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    return response.data.data;
  }
);

export const deleteReservation = createAsyncThunk(
  "reservation/deleteReservation",
  async (reservationId) => {
    const response = await axios.delete(`${RESERVATION_URL}/${reservationId}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

export const resetReservation = createAsyncThunk(
  "reservation/resetReservation",
  async (reservationId) => {
    const response = await axios.put(
      `${RESERVATION_URL}/reset/${reservationId}`,
      {
        date: "",
        time: "",
        guest: null,
      },
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    return response.data;
  }
);

const reservationSlice = createSlice({
  name: "reservation",
  initialState: {
    reservations: [],
    getReservationStatus: "idle",
    reservationBranch: [],
    getReservationBranchStatus: "idle",
    createReservationStatus: "idle",
    updateReservationStatus: "idle",
    deleteReservationStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getReservation.pending, (state) => {
        state.getReservationStatus = "loading";
      })
      .addCase(getReservation.fulfilled, (state, action) => {
        state.getReservationStatus = "succeeded";
        state.reservations = action.payload;
      })
      .addCase(getReservation.rejected, (state, action) => {
        state.getReservationStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(getReservationBranch.pending, (state) => {
        state.getReservationBranchStatus = "loading";
      })
      .addCase(getReservationBranch.fulfilled, (state, action) => {
        state.getReservationBranchStatus = "succeeded";
        state.reservationBranch = action.payload;
      })
      .addCase(getReservationBranch.rejected, (state, action) => {
        state.getReservationBranchStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(getReservationById.pending, (state) => {
        state.getReservationStatus = "loading";
      })
      .addCase(getReservationById.fulfilled, (state, action) => {
        state.getReservationStatus = "succeeded";
        const existingIndex = state.reservations.findIndex(
          (reservation) =>
            reservation.reservationId === action.payload.reservationId
        );
        if (existingIndex !== -1) {
          // Update jika sudah ada
          state.reservations[existingIndex] = action.payload;
        } else {
          // Tambahkan jika belum ada
          state.reservations.push(action.payload);
        }
      })
      .addCase(getReservationById.rejected, (state, action) => {
        state.getReservationStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(createReservation.pending, (state) => {
        state.createReservationStatus = "loading";
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.createReservationStatus = "succeeded";
        state.reservations.push(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.createReservationStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(updateReservation.pending, (state) => {
        state.updateReservationStatus = "loading";
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.updateReservationStatus = "succeeded";
        const index = state.reservations.findIndex(
          (reservation) =>
            reservation.reservationId === action.payload.reservationId
        );
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.updateReservationStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteReservation.pending, (state) => {
        state.deleteReservationStatus = "loading";
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.deleteReservationStatus = "succeeded";
        state.reservations = state.reservations.filter(
          (reservation) => reservation.reservationId !== action.payload
        );
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.deleteReservationStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(resetReservation.pending, (state) => {
        state.updateReservationStatus = "loading";
      })
      .addCase(resetReservation.fulfilled, (state, action) => {
        state.updateReservationStatus = "succeeded";
        const index = state.reservations.findIndex(
          (reservation) =>
            reservation.reservationId === action.payload.reservationId
        );
        if (index !== -1) {
          state.reservations[index].date = "";
          state.reservations[index].time = "";
          state.reservations[index].guest = null;
        }
      })
      .addCase(resetReservation.rejected, (state, action) => {
        state.updateReservationStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default reservationSlice.reducer;

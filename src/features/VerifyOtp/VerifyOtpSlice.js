import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const VERIFY_OTP_URL = `${API}/verify-otp`;
const RESEND_OTP_URL = `${API}/resend-otp`;

export const verifyOtp = createAsyncThunk(
  "verifyOtp/verifyOtp",
  async ({ customerId, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(VERIFY_OTP_URL, {
        customerId: customerId,
        otp,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

export const resendOtp = createAsyncThunk(
  "verifyOtp/resendOtp",
  async ({ customerId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(RESEND_OTP_URL, {
        customerId: customerId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

const verifyOtpSlice = createSlice({
  name: "verifyOtp",
  initialState: {
    verifyOtpStatus: "idle",
    resendOtpStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.verifyOtpStatus = "loading";
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.verifyOtpStatus = "succeeded";
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyOtpStatus = "failed";
        state.error = action.payload?.message || "Something went wrong";
      })
      .addCase(resendOtp.pending, (state) => {
        state.resendOtpStatus = "loading";
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.resendOtpStatus = "succeeded";
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.resendOtpStatus = "failed";
        state.error = action.payload?.message || "Something went wrong";
      });
  },
});

export default verifyOtpSlice.reducer;

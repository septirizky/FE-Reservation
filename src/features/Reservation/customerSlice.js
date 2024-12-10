import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API from "../API/Api";

const CUSTOMER_URL = `${API}/customer`;

export const getCustomer = createAsyncThunk(
  "customer/getCustomer",
  async () => {
    const response = await axios.get(CUSTOMER_URL, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

export const getCustomerDetail = createAsyncThunk(
  "customer/getCustomerDetail",
  async (customerId) => {
    const response = await axios.get(`${CUSTOMER_URL}/${customerId}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data.data;
  }
);

export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (customerData) => {
    const response = await axios.post(CUSTOMER_URL, customerData, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data;
  }
);

export const createCustomerGRO = createAsyncThunk(
  "customer/createCustomerGRO",
  async (customerData) => {
    const response = await axios.post(`${CUSTOMER_URL}_gro`, customerData, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response.data;
  }
);

export const updateCustomer = createAsyncThunk(
  "customer/updateCustomer",
  async ({ customerId, customerData }) => {
    const response = await axios.put(
      `${CUSTOMER_URL}/${customerId}`,
      customerData,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    return response.data.data;
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    customers: [],
    customerDetail: null,
    getCustomerStatus: "idle",
    getCustomerDetailStatus: "idle",
    createCustomerStatus: "idle",
    createCustomerGROStatus: "idle",
    updateCustomerStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCustomer.pending, (state) => {
        state.getCustomerStatus = "loading";
      })
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.getCustomerStatus = "succeeded";
        state.customers = action.payload;
      })
      .addCase(getCustomer.rejected, (state, action) => {
        state.getCustomerStatus = "failed";
        state.error = action.error.message;
      })
      // Get Customer Detail
      .addCase(getCustomerDetail.pending, (state) => {
        state.getCustomerDetailStatus = "loading";
      })
      .addCase(getCustomerDetail.fulfilled, (state, action) => {
        state.getCustomerDetailStatus = "succeeded";
        state.customerDetail = action.payload;
      })
      .addCase(getCustomerDetail.rejected, (state, action) => {
        state.getCustomerDetailStatus = "failed";
        state.error = action.error.message;
      })
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.createCustomerStatus = "loading";
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.createCustomerStatus = "succeeded";
        state.customers.push(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.createCustomerStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(createCustomerGRO.pending, (state) => {
        state.createCustomerGROStatus = "loading";
      })
      .addCase(createCustomerGRO.fulfilled, (state, action) => {
        state.createCustomerGROStatus = "succeeded";
        state.customers.push(action.payload);
      })
      .addCase(createCustomerGRO.rejected, (state, action) => {
        state.createCustomerGROStatus = "failed";
        state.error = action.error.message;
      })
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.updateCustomerStatus = "loading";
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.updateCustomerStatus = "succeeded";
        state.customerDetail = action.payload;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.updateCustomerStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default customerSlice.reducer;

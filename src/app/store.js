import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "../features/Home/homeSlice";
import branchReducer from "../features/Branch/branchSlice";
import customerReducer from "../features/Reservation/customerSlice";
import reservationReducer from "../features/Reservation/reservationSlice";
import verifyOtpReducer from "../features/VerifyOtp/VerifyOtpSlice";
import menuReducer from "../features/Menu/menuSlice";
import packageReducer from "../features/Menu/packageSlice";
import categoryReducer from "../features/Menu/categorySlice";
import cartReducer from "../features/Menu/cartSlice";
import optionReducer from "../features/Menu/optionSlice";
import confirmationReducer from "../features/Confirmation/confirmationSlice";
import invoiceReducer from "../features/Invoice/invoiceSlice";
import configReducer from "../features/Config/configSlice";

export const store = configureStore({
  reducer: {
    home: homeReducer,
    branch: branchReducer,
    customer: customerReducer,
    reservation: reservationReducer,
    verifyOtp: verifyOtpReducer,
    menu: menuReducer,
    package: packageReducer,
    category: categoryReducer,
    cart: cartReducer,
    option: optionReducer,
    confirmation: confirmationReducer,
    invoice: invoiceReducer,
    config: configReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

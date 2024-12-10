import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
  },
  reducers: {
    addItemToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.cartItems.find(
        (cartItem) => cartItem.MenusID === item.MenusID
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.cartItems.push(item);
      }
    },
    removeItemFromCart: (state, action) => {
      const MenusID = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => item.MenusID !== MenusID
      );
    },
    updateItemQuantity: (state, action) => {
      const { MenusID, quantity } = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.MenusID === MenusID
      );
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
  },
});

export const { addItemToCart, removeItemFromCart, updateItemQuantity } =
  cartSlice.actions;

export default cartSlice.reducer;

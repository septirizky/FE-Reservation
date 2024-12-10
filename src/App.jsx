import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { Layout } from "./features/Components/Layout";
import { Home } from "./features/Home/Components/Home";
import { Branch } from "./features/Branch/Components/Branch";
import { Reservation } from "./features/Reservation/Components/Reservation";
import { VerifyOtp } from "./features/VerifyOtp/Components/VerifyOtp";
import { Menu } from "./features/Menu/Components/Menu";
import { Confirmation } from "./features/Confirmation/Components/Confirmation";
import CategoryUpload from "./features/Upload/Components/CategoryUpload";
import MenuUpload from "./features/Upload/Components/MenuUpload";
import { ReservationGRO } from "./features/Reservation/Components/ReservationGRO";
import { Invoice } from "./features/Confirmation/Components/Invoice";

export default function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path=":BranchCategoryName" element={<Branch />} />
              <Route path="r/:BranchCode" element={<Reservation />} />
              <Route path="r/:BranchCode/gro" element={<ReservationGRO />} />
              <Route
                path="r/:BranchCode/:customerId/:reservationId/verify-otp"
                element={<VerifyOtp />}
              />
              <Route path="r/:BranchCode/:reservationId" element={<Menu />} />
              <Route
                path="r/:BranchCode/:reservationId/confirmation"
                element={<Confirmation />}
              />
              <Route path="invoice/:reservationId" element={<Invoice />} />
              <Route
                path="upload/category/:BranchCode"
                element={<CategoryUpload />}
              />
              <Route path="upload/menu/:BranchCode" element={<MenuUpload />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

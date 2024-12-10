import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getReservationDetail } from "../confirmationSlice";
import logo_bandar from "../../../../public/logo_bandar.png";
import { getBranchDetail } from "../../Branch/branchSlice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

export const Invoice = () => {
  const { reservationId } = useParams();
  const dispatch = useDispatch();

  const reservationDetail = useSelector(
    (state) => state.confirmation.reservationDetail
  );
  const branchDetails = useSelector((state) => state.branch.branchDetail);
  const BranchCode = reservationDetail?.branchCode;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch(getReservationDetail(reservationId));
      setIsLoading(false);
    };
    fetchData();
  }, [dispatch, reservationId]);

  useEffect(() => {
    if (BranchCode) {
      dispatch(getBranchDetail(BranchCode));
    }
  }, [BranchCode, dispatch]);

  const formatRupiah = (number) =>
    number.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const subtotal = (quantity, price) => quantity * price;

  const tax = (subtotal, cookingCharge) => (subtotal + cookingCharge) * 0.1;
  const calculateTotal = (subtotal, tax, cookingCharge) =>
    subtotal + tax + cookingCharge;

  const calculateTotalCookingCharge = () => {
    return (
      reservationDetail?.items?.reduce((total, item) => {
        return total + (item.CookingCharge || 0) * item.quantities;
      }, 0) || 0
    );
  };

  const totalCookingCharge = calculateTotalCookingCharge();
  const totalSubtotal = reservationDetail?.amount || 0;
  const totalTax = tax(totalSubtotal, totalCookingCharge);
  const totalAmount = calculateTotal(
    totalSubtotal,
    totalTax,
    totalCookingCharge
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex justify-center items-center relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={handlePrint}
            className="text-gray-700 hover:text-indigo-800"
          >
            <FontAwesomeIcon icon={faPrint} size="2x" />
          </button>
        </div>
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between border-b pb-4 mb-4 items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-indigo-800">RECEIPT</h1>
              <p className="text-gray-600">
                {reservationDetail?.reservationCode || "Loading..."}
              </p>
            </div>
            <div className="flex-1 text-right">
              <img
                src={logo_bandar}
                alt="Bandar Djakarta"
                className="h-8 sm:h-12 mx-auto mt-4 sm:mt-0" 
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-bold">
              {reservationDetail?.branchName || "Loading..."}
            </p>
            <p className="text-sm">
              {branchDetails?.BranchAddress || "Loading..."}
            </p>
            <p className="text-sm font-semibold">
              {branchDetails?.BranchPhone || "Loading..."}
            </p>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <p className="text-sm font-bold">Nama Lengkap</p>
              <p className="text-sm">
                {reservationDetail?.customer?.name || "Loading..."}
              </p>
              <p className="text-sm font-bold">Nomor Telepon</p>
              <p className="text-sm">{reservationDetail?.customer?.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">Tanggal Reservasi</p>
              <p className="text-sm">{formatDate(reservationDetail?.date)}</p>
              <p className="text-sm font-bold">Jumlah Tamu</p>
              <p className="text-sm">{reservationDetail?.guest} Tamu</p>
            </div>
          </div>

          <table className="w-full mb-6 text-left text-sm">
            <thead>
              <tr className="bg-indigo-800 text-white">
                <th className="p-2">Item</th>
                <th className="p-2">Kuantitas</th>
                <th className="p-2">Harga</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {reservationDetail?.items?.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.MenuName}</td>
                  <td className="p-2 text-center">{item.quantities}</td>
                  <td className="p-2 text-right">
                    {formatRupiah(item.MenuPrice)}
                  </td>
                  <td className="p-2 text-right">
                    {formatRupiah(subtotal(item.quantities, item.MenuPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right mb-8">
            <div className="flex justify-end mb-2">
              <p className="w-32">Subtotal:</p>
              <p className="w-32 text-right">{formatRupiah(totalSubtotal)}</p>
            </div>
            {totalCookingCharge > 0 && (
              <div className="flex justify-end mb-2">
                <p className="w-32">Total Cooking Charge:</p>
                <p className="w-32 text-right">
                  {formatRupiah(totalCookingCharge)}
                </p>
              </div>
            )}
            <div className="flex justify-end mb-2">
              <p className="w-32">Pajak 10%:</p>
              <p className="w-32 text-right">{formatRupiah(totalTax)}</p>
            </div>
            <div className="flex justify-end font-bold text-lg">
              <p className="w-32">Total:</p>
              <p className="w-32 text-right text-indigo-800">
                {formatRupiah(totalAmount)}
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Terima Kasih <br />
            <a
              href="https://www.bandar-djakarta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              www.bandar-djakarta.com
            </a>
            <br />
            <a
              href="https://www.pesisirseafood.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              www.pesisirseafood.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Header } from "../../Components/Header";
import { StepKonfirmasi } from "../../Components/step/StepKonfirmasi";
import { getReservationDetail, updateTax } from "../confirmationSlice";
import { createInvoice } from "../../Invoice/invoiceSlice";
import Swal from "sweetalert2";
import { getConfig } from "../../Config/configSlice";

export const Confirmation = () => {
  const { BranchCode, reservationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reservationDetail = useSelector(
    (state) => state.confirmation.reservationDetail
  );
  const branchDetails = useSelector((state) => state.branch.branchDetail);
  const configData = useSelector((state) => state.config.config);
  const [isLoading, setIsLoading] = useState(true);

  const taxRate = parseFloat(
    configData.find((config) => config.title === "TAX")?.content || 0
  );

  const dpRate = parseFloat(
    configData.find((config) => config.title === "DP")?.content || 0
  );

  const mdrRate = parseFloat(
    configData.find((config) => config.title === "MDR")?.content || 0
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch(getReservationDetail(reservationId));

      const currentReservation = await dispatch(
        getReservationDetail(reservationId)
      ).unwrap();
      if (currentReservation?.reservationCode) {
        navigate("/");
      }

      setIsLoading(false);
    };
    fetchData();
    dispatch(getConfig());
  }, [dispatch, reservationId, navigate]);

  const handleBack = useCallback(() => {
    navigate(`/r/${BranchCode}/${reservationId}`);
  }, [navigate, BranchCode, reservationId]);

  useEffect(() => {
    const savedEndTime = localStorage.getItem("endTime");
    const currentTime = Date.now();

    if (savedEndTime) {
      const remainingTime = Math.floor(
        (parseInt(savedEndTime, 10) - currentTime) / 1000
      );

      if (remainingTime <= 0) {
        handleBack();
      }
    }
  }, [handleBack]);

  const formatRp = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);

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

  const totalMDR = mdrRate / 100;

  const subtotal = (quantity, price, details) => {
    const detailsPrice = details?.reduce((total, detail) => {
      return total + (detail.ItemPackageDetailPrice || 0);
    }, 0);
    return quantity * (price + detailsPrice);
  };

  const tax = (subtotal, cookingCharge) =>
    (subtotal + cookingCharge) * (taxRate / 100);
  const calculateTotal = (subtotal, tax, cookingCharge) =>
    subtotal + tax + cookingCharge;

  const calculateTotalCookingCharge = () => {
    return (
      reservationDetail?.items?.reduce((total, item) => {
        return total + (item.CookingCharge || 0) * item.quantities;
      }, 0) || 0
    );
  };

  const generateReservationCode = (branchCode) => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const randomFiveDigit = String(Math.floor(10000 + Math.random() * 90000));
    return `${branchCode}-${formattedDate}-${randomFiveDigit}`;
  };

  const handlePayment = async () => {
    if (isLoading) return;
    setIsLoading(true);

    Swal.fire({
      title: "Loading...",
      text: "Mohon Tunggu",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    if (totalSubtotal < branchDetails?.BranchMinimumPurchase) {
      Swal.close();
      Swal.fire({
        icon: "warning",
        title: "Minimum Pembelian Tidak Tercapai",
        text: `Subtotal harus minimal ${formatRp(
          branchDetails.BranchMinimumPurchase
        )}. Tambahkan item untuk mencapai minimum pembelian.`,
      });
      setIsLoading(false);
      return;
    }

    try {
      const reservationCode = generateReservationCode(
        reservationDetail.branchCode
      );
      const updatedData = {
        reservationCode: reservationCode,
        tax: totalTax,
        cookingCharge: totalCookingCharge,
        totalAmount: totalAmount,
        dp: totalDP,
        isDisbursed: false,
        mdr: totalMDR,
      };
      await dispatch(updateTax({ reservationId, updatedData }));

      const invoiceData = {
        order_id: reservationId,
        reservationCode: reservationCode,
        reservation: {
          reservationId: reservationId,
          branchCode: reservationDetail.branchCode,
          branchName: reservationDetail.branchName,
          date: reservationDetail.date,
          time: reservationDetail.time,
          pax: reservationDetail.pax,
          customer: reservationDetail.customer,
          items: reservationDetail.items,
          amount: reservationDetail.amount,
          tax: totalTax,
          cookingCharge: totalCookingCharge,
          totalAmount: totalAmount,
          dp: totalDP,
          mdr: totalMDR,
          note: reservationDetail.note,
        },
      };

      const invoiceResponse = await dispatch(
        createInvoice(invoiceData)
      ).unwrap();
      localStorage.removeItem("reservationId");
      localStorage.removeItem("endTime");
      localStorage.removeItem("mainNote");
      localStorage.removeItem("cart");
      localStorage.removeItem("served");

      if (invoiceResponse.invoice_url) {
        window.location.href = invoiceResponse.invoice_url;
      }
    } catch (error) {
      console.error("Error saat membuat invoice:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal membuat invoice. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
      Swal.close();
    }
  };

  const totalCookingCharge = calculateTotalCookingCharge();
  const totalSubtotal = Math.round(
    reservationDetail?.items?.reduce((total, item) => {
      return (
        total +
        subtotal(item.quantities, item.MenuPrice, item.ItemDetails || [])
      );
    }, 0) || 0
  );

  const totalTax = Math.round(tax(totalSubtotal, totalCookingCharge));
  const totalAmount = calculateTotal(
    totalSubtotal,
    totalTax,
    totalCookingCharge
  );

  const totalDP = Math.round(totalAmount * (dpRate / 100));

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header onBack={handleBack} />
        <div className="flex flex-col p-2 bg-white rounded-lg">
          <div className="p-4 space-y-4">
            <StepKonfirmasi step={3} />
          </div>

          <div className="bg-white rounded-lg p-4 space-y-4 w-full">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Konfirmasi Reservasi
            </h2>

            {isLoading ? (
              <p>Loading...</p>
            ) : reservationDetail ? (
              <>
                <div className="text-sm font-semibold">
                  <div className="mb-1 pb-1">
                    <div className="flex">
                      <p className="w-36">Nama</p>
                      <p className="mr-2">:</p>
                      <p className="flex-1">
                        {reservationDetail.customer.name}
                      </p>
                    </div>
                  </div>

                  <div className="mb-1 pb-1">
                    <div className="flex">
                      <p className="w-36">Tanggal Reservasi</p>
                      <p className="mr-2">:</p>
                      <p className="flex-1">
                        {formatDate(reservationDetail.date)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-1 pb-1">
                    <div className="flex">
                      <p className="w-36">Waktu Reservasi</p>
                      <p className="mr-2">:</p>
                      <p className="flex-1">{reservationDetail.time}</p>
                    </div>
                  </div>

                  <div className="mb-1 pb-1">
                    <div className="flex">
                      <p className="w-36">Jumlah Tamu</p>
                      <p className="mr-2">:</p>
                      <p className="flex-1">{reservationDetail.pax} Tamu</p>
                    </div>
                  </div>

                  <div className="mb-1 pb-1">
                    <div className="flex">
                      <p className="w-36">Catatan Khusus</p>
                      <p className="mr-2">:</p>
                      <p className="flex-1">
                        {reservationDetail.noteReservation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex font-semibold justify-between items-center mb-2">
                  <h3 className="text-md ">Ringkasan Pesanan:</h3>
                  <p
                    className="text-md text-purple-900 cursor-pointer"
                    onClick={handleBack}
                  >
                    Edit Item
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 leading-tight">
                  {reservationDetail.items?.length > 0 ? (
                    reservationDetail.items.map((item, index) => (
                      <div key={index} className="mb-4 border-b pb-2">
                        <div className="flex justify-between items-start">
                          <div className="w-12 text-center font-semibold text-sm flex-shrink-0">
                            {item.quantities}x
                          </div>
                          <div className="flex flex-col w-full ml-2">
                            <h4 className="text-sm font-semibold leading-tight break-words">
                              {item.MenuName}
                            </h4>
                            {item.ItemDetails?.length > 0 ? (
                              <ul className="text-xs text-gray-500 list-disc ml-4 mt-1">
                                {item.ItemDetails.map((detail, idx) => (
                                  <li key={idx}>
                                    {detail.ItemPackageDetail}
                                    {detail.ItemPackageDetailPrice > 0 &&
                                      `(+${formatRupiah(
                                        detail.ItemPackageDetailPrice
                                      )})`}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              item.OptionName && (
                                <li className="text-xs text-gray-500 mt-1">
                                  {item.OptionName}
                                </li>
                              )
                            )}
                          </div>
                          <div className="w-1/3 text-sm text-right font-semibold">
                            {formatRupiah(
                              subtotal(
                                item.quantities,
                                item.MenuPrice,
                                item.ItemDetails || []
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Loading order details...</p>
                  )}
                </div>

                <div className="border-t p-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm w-1/3">Subtotal</h2>
                    <div className="flex text-sm items-center w-2/3 justify-end">
                      <span className="w-10 text-right">Rp</span>
                      <p className="ml-1 w-20 text-right">
                        {formatRupiah(totalSubtotal)}
                      </p>
                    </div>
                  </div>

                  {totalCookingCharge !== 0 && (
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm w-1/3">Total Cooking Charge</h2>
                      <div className="flex text-sm items-center w-2/3 justify-end">
                        <span className="w-10 text-right">Rp</span>
                        <p className="ml-1 w-20 text-right">
                          {formatRupiah(totalCookingCharge)}
                        </p>
                      </div>
                    </div>
                  )}

                  {totalTax !== 0 && (
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm w-1/3">PB1</h2>
                      <div className="flex text-sm items-center w-2/3 justify-end">
                        <span className="w-10 text-right">Rp</span>
                        <p className="ml-1 w-20 text-right">
                          {formatRupiah(totalTax)}
                        </p>
                      </div>
                    </div>
                  )}

                  {totalAmount !== totalSubtotal ? (
                    <div className="flex justify-between font-semibold items-center">
                      <h2 className="text-md w-1/3">Total</h2>
                      <div className="flex text-md items-center w-2/3 justify-end">
                        <span className="w-10 text-right">Rp</span>
                        <p className="ml-1 w-20 text-right">
                          {formatRupiah(totalAmount)}
                        </p>
                      </div>
                    </div>
                  ) : dpRate === 0 ? (
                    <div className="flex justify-between font-semibold items-center">
                      <h2 className="text-md w-1/3">Total</h2>
                      <div className="flex text-md items-center w-2/3 justify-end">
                        <span className="w-10 text-right">Rp</span>
                        <p className="ml-1 w-20 text-right">
                          {formatRupiah(totalAmount)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {dpRate !== 0 && (
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm w-1/3">DP</h2>
                      <div className="flex text-sm items-center w-2/3 justify-end">
                        <p className="ml-1 w-20 text-right">
                          {formatRupiah(dpRate)} %
                        </p>
                      </div>
                    </div>
                  )}

                  {dpRate !== 0 && (
                    <div className="flex justify-between font-semibold items-center">
                      <h2 className="text-md w-1/3">Total DP</h2>
                      <div className="flex text-md items-center w-2/3 justify-end">
                        <span className="w-10 text-right">Rp</span>
                        <p className="ml-1 w-20 text-right">
                          {formatRupiah(totalDP)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {totalSubtotal < branchDetails?.BranchMinimumPurchase && (
                  <div>
                    <h2>
                      Minimum Subtotal untuk reservasi adalah{" "}
                      {formatRp(branchDetails?.BranchMinimumPurchase)}
                    </h2>
                  </div>
                )}

                <div className="text-center mt-6">
                  <button
                    className={`bg-purple-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-300 transition duration-300 ${
                      isLoading ? "bg-gray-500 cursor-not-allowed" : ""
                    }`}
                    onClick={handlePayment}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Konfirmasi"}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Jika ada perubahan, silakan hubungi kami melalui telepon
                    atau WhatsApp.
                  </p>
                </div>
              </>
            ) : (
              <p>{isLoading ? "Loading..." : "Loading order details..."}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

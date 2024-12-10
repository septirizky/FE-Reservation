import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { resendOtp, verifyOtp } from "../VerifyOtpSlice";
import { Header } from "../../Components/Header";
import { deleteReservation } from "../../Reservation/reservationSlice";

export const VerifyOtp = () => {
  const { BranchCode, customerId, reservationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { verifyOtpStatus: status, error } = useSelector(
    (state) => state.verifyOtp
  );
  const { resendOtpStatus } = useSelector((state) => state.verifyOtp);

  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(60);
  const isOtpValid = otp.length === 6;

  const handleBack = useCallback(async () => {
    await dispatch(deleteReservation(reservationId)).unwrap();
    navigate(`/r/${BranchCode}`);
  }, [dispatch, reservationId, BranchCode, navigate]);

  useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await dispatch(verifyOtp({ customerId, otp })).unwrap();
      if (response.message === "OTP verified successfully.") {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "OTP terverifikasi!",
        });
        navigate(`/r/${BranchCode}/${reservationId}`);
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error?.message || "Verifikasi OTP gagal.",
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await dispatch(resendOtp({ customerId })).unwrap();
      if (result.message === "OTP baru berhasil dikirim ulang.") {
        setCounter(60); // Reset counter
        Swal.fire({
          icon: "info",
          title: "OTP Dikirim Ulang",
          text: "OTP baru telah dikirim ulang ke nomor Anda.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error?.message || "Gagal mengirim ulang OTP.",
      });
    }
  };

  const handleOtpChange = (e) => {
    const input = e.target.value.replace(/\D/g, ""); // Hanya angka
    setOtp(input.slice(0, 6)); // Maksimal 6 angka
  };

  return (
    <>
      <Header onBack={handleBack} />
      <div className="container mx-auto max-w-md flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-700 p-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-6">Verifikasi OTP</h2>
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Masukkan OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-700 focus:border-purple-700 sm:text-sm"
                placeholder="Masukkan OTP"
                required
              />
            </div>

            {status === "loading" && (
              <p className="text-sm text-gray-500">Memverifikasi OTP...</p>
            )}
            {error && <p className="text-red-500">{error}</p>}

            <div className="flex justify-center mb-4">
              <button
                type="submit"
                className={`py-2 px-6 rounded-lg focus:outline-none focus:ring-2 ${
                  isOtpValid
                    ? "bg-purple-700 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isOtpValid || status === "loading"}
              >
                Verifikasi OTP
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-500">
            {resendOtpStatus === "loading" ? (
              <p>Mengirim ulang OTP...</p>
            ) : counter > 0 ? (
              <p>Belum menerima? Kirim ulang OTP dalam {counter} detik</p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-blue-500 underline"
              >
                Kirim ulang OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

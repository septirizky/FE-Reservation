import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CountrySelect from "../../Components/CountrySelect";
import {
  createReservation,
  deleteReservation,
  getReservationBranch,
} from "../reservationSlice";
import { Header } from "../../Components/Header";
import { StepInformasi } from "../../Components/step/StepInformasi";
import Swal from "sweetalert2";
import { createCustomer } from "../customerSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getBranchQuota } from "../../Branch/branchSlice";
import { getConfig } from "../../Config/configSlice";

const formatDate = (date) => {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options).replace(/ /g, " ");
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const formatTime = (time) => time;

export const Reservation = () => {
  const { BranchCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const branchDetails = useSelector((state) => state.branch.branchDetail);
  const reservations = useSelector(
    (state) => state.reservation.reservationBranch
  );
  const configData = useSelector((state) => state.config.config);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+62");
  const [phone, setPhone] = useState("");
  const [pax, setPax] = useState("");
  const [date, setDate] = useState(getTomorrowDate());
  const [time, setTime] = useState("");
  const [noteReservation, setNoteReservation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const [hasDeleted, setHasDeleted] = useState(false);
  const isFirstRun = useRef(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [quotaByTime, setQuotaByTime] = useState({});
  const [timeCapacity, setTimeCapacity] = useState({});
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    if (!date || !quotaByTime || !reservations) return;

    const selectedDate = date.toISOString().split("T")[0];
    const slots = quotaByTime[selectedDate] || [];

    const capacityData = {};

    slots.forEach((slot) => {
      const totalPax = reservations
        .filter((res) => res.date === selectedDate && res.time === slot.time)
        .reduce((sum, res) => sum + res.pax, 0);

      const remainingQuota = slot.quota - totalPax;
      capacityData[slot.time] = remainingQuota > 0 ? remainingQuota : 0;
    });

    setTimeCapacity(capacityData);
  }, [date, quotaByTime, reservations]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const reservationId = localStorage.getItem("reservationId");

    if (reservationId && !hasDeleted) {
      dispatch(deleteReservation(reservationId))
        .unwrap()
        .then(() => {
          localStorage.removeItem("reservationId");
          setHasDeleted(true);
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            console.log("Reservation not found, clearing localStorage.");
            localStorage.removeItem("reservationId");
          } else {
            console.error("Error deleting reservation:", error);
          }
          setHasDeleted(true);
        });
    }
  }, [dispatch, hasDeleted]);

  useEffect(() => {
    const fetchQuotaData = async () => {
      try {
        const response = await dispatch(getBranchQuota(BranchCode)).unwrap();
        const dates = Array.from(new Set(response.map((q) => q.date)));
        setAvailableDates(dates);

        const timeData = {};
        response.forEach((quota) => {
          if (!timeData[quota.date]) timeData[quota.date] = [];
          timeData[quota.date].push({
            time: quota.time,
            quota: quota.quota,
            show: quota.show,
          });
        });
        setQuotaByTime(timeData);
      } catch (error) {
        console.error("Failed to fetch quota data", error);
      }
    };

    fetchQuotaData();
    dispatch(getReservationBranch(BranchCode));
    dispatch(getConfig());
  }, [dispatch, BranchCode]);

  useEffect(() => {
    if (configData && configData.length > 0) {
      const filteredPolicies = configData.filter(
        (item) => item.title === "KEBIJAKAN PRIVASI" && item.show
      );
      setPolicies(filteredPolicies);
    }
  }, [configData]);

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("formData"));
    if (savedData) {
      setName(savedData.name || "");
      setEmail(savedData.email || "");
      setPhone(savedData.phone || "");
    }
  }, []);

  const handleSaveData = useCallback(() => {
    const formData = {
      name,
      email,
      phone,
    };
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [name, email, phone]);

  const handleCountryCodeChange = (e) => {
    const selectedCode = e.target.value;
    setCountryCode(selectedCode);
  };

  const handlePhoneChange = (e) => {
    let phone = e.target.value.replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = phone.slice(1);
    }

    setPhone(phone);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!name || !phone || !email || !pax || !time) {
        Swal.fire({
          icon: "warning",
          title: "Form Tidak Lengkap",
          text: "Harap isi semua kolom yang wajib diisi dan pilih waktu reservasi sebelum melanjutkan.",
        });
        return;
      }

      handleSaveData();

      if (pax > timeCapacity[time]) {
        Swal.fire({
          icon: "warning",
          title: "Kapasitas Tamu Tidak Cukup",
          text: `Hanya tersisa ${timeCapacity[time]} tamu untuk waktu ${time}. Silakan kurangi jumlah tamu.`,
        });
        return;
      }

      setIsLoading(true);

      const customerData = {
        name: name,
        phone: countryCode + phone,
        email: email,
        branchName: branchDetails.branchName,
      };

      try {
        Swal.fire({
          title: "Loading...",
          text: "Mohon Tunggu",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const customerResponse = await dispatch(
          createCustomer(customerData)
        ).unwrap();

        const customerId = customerResponse.data.customerId;

        const reservationData = {
          branchCode: BranchCode,
          branchName: branchDetails.branchName,
          date: formatDate(date),
          time: formatTime(time),
          pax: pax,
          noteReservation: noteReservation,
          customer: {
            customerId: customerId,
            name: name,
            phone: countryCode + phone,
            email: email,
          },
        };

        const reservationResponse = await dispatch(
          createReservation(reservationData)
        ).unwrap();

        const reservationId = reservationResponse.data.reservationId;

        localStorage.setItem("reservationId", reservationId);

        if (customerResponse.data.otpVerified) {
          navigate(`/r/${BranchCode}/${reservationId}`);
        } else if (!customerResponse.data.otpVerified) {
          navigate(
            `/r/${BranchCode}/${customerId}/${reservationId}/verify-otp`,
            {
              state: { customerId: customerResponse.data.customerId },
            }
          );
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengirim data customer atau reservasi. Silakan coba lagi.",
        });
      } finally {
        setIsLoading(false);
        Swal.close();
      }
    },
    [
      BranchCode,
      countryCode,
      branchDetails,
      date,
      dispatch,
      email,
      pax,
      noteReservation,
      name,
      navigate,
      phone,
      time,
      timeCapacity,
      handleSaveData,
    ]
  );

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header onBack={handleBack} />
        <div className="flex flex-col p-2 bg-white rounded-lg">
          <div className="p-4 space-y-4">
            <StepInformasi />
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-4 space-y-4 w-full"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-900 focus:border-purple-900 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Whatsapp
              </label>

              <div className="flex">
                <CountrySelect
                  countryCode={countryCode}
                  handleCountryCodeChange={handleCountryCodeChange}
                />

                {countryCode === "other" && (
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="form-input block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                )}

                {countryCode !== "other" && (
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="form-input block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-900 focus:border-purple-900 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Tamu
              </label>
              <input
                type="number"
                value={pax}
                onChange={(e) => {
                  const inputPax = e.target.value;
                  const formattedPax = inputPax.replace(/^0+/, "");

                  if (formattedPax === "") {
                    setPax("");
                  } else {
                    const numericPax = Number(formattedPax);
                    setPax(numericPax);
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-900 focus:border-purple-900 sm:text-sm"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal
              </label>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                includeDates={availableDates.map((d) => new Date(d))}
                minDate={getTomorrowDate()}
                dateFormat="dd/MM/yyyy"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {date && (
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pilih Waktu
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {quotaByTime[date.toISOString().split("T")[0]]
                    ?.filter((slot) => slot.show)
                    .map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`rounded-lg h-auto min-h-[50px] flex items-center justify-center ${
                          time === slot.time
                            ? "bg-gray-300"
                            : timeCapacity[slot.time] === 0
                            ? "bg-red-500 text-white cursor-not-allowed"
                            : timeCapacity[slot.time] <= 20
                            ? "bg-yellow-500 text-white"
                            : "bg-purple-900 text-white"
                        }`}
                        onClick={() => setTime(slot.time)}
                        disabled={timeCapacity[slot.time] === 0}
                      >
                        {slot.time} <br />
                        {timeCapacity[slot.time] === 0
                          ? "Penuh"
                          : timeCapacity[slot.time] <= 20
                          ? `Tersisa ${timeCapacity[slot.time]}`
                          : ""}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-md mr-2"></div>
                <span className="text-sm text-gray-700">Penuh</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-md mr-2"></div>
                <span className="text-sm text-gray-700">Hampir Penuh</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-900 rounded-md mr-2"></div>
                <span className="text-sm text-gray-700">Tersedia</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Catatan Khusus
              </label>
              <input
                type="text"
                value={noteReservation}
                onChange={(e) => setNoteReservation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-900 focus:border-purple-900 sm:text-sm"
              />
            </div>

            <div className="max-h-60 overflow-y-auto border p-4 bg-gray-100 rounded-md mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Kebijakan Informasi Pelanggan:
              </h3>
              <div className="mt-2 text-gray-700 text-sm space-y-2">
                {policies.map((policy, index) => (
                  <p key={index}>
                    {index + 1}. {policy.content}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="checkbox accent-purple-900 h-4 w-4 text-purple-900 border-gray-300 rounded focus:ring-purple-900"
              />
              <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
                Saya telah membaca dan menyetujui syarat dan ketentuan.
              </label>
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                className="bg-red-500 text-white py-2 px-4 rounded-lg"
                onClick={() => navigate(-1)}
              >
                Kembali
              </button>
              <button
                type="submit"
                className={`py-2 px-4 rounded-lg ${
                  agree && !isLoading
                    ? "bg-purple-900 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!agree || isLoading}
              >
                {isLoading ? "Loading..." : "Selanjutnya"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

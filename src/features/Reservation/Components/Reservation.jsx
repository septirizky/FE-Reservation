import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const branchQuota = useSelector((state) => state.branch.branchQuota);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+62");
  const [phone, setPhone] = useState("");
  const [guest, setGuest] = useState("");
  const [date, setDate] = useState(getTomorrowDate());
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const [hasDeleted, setHasDeleted] = useState(false);
  const isFirstRun = useRef(true);

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
    dispatch(getReservationBranch(BranchCode));
    dispatch(getBranchQuota(BranchCode));
  }, [dispatch, BranchCode]);

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

  const getDayOfWeek = (dateStr) => {
    return new Date(dateStr).getDay();
  };

  const tomorrowDate = getTomorrowDate();
  tomorrowDate.setDate(tomorrowDate.getDate());

  const timeOptions = useMemo(() => {
    const dayOfWeek = getDayOfWeek(date);
    const startHour =
      dayOfWeek === 0 || dayOfWeek === 6
        ? branchDetails?.BranchWeekEndOpen
        : branchDetails?.BranchWeekDayOpen;
    const endHour =
      dayOfWeek === 0 || dayOfWeek === 6
        ? branchDetails?.BranchWeekEndClosed
        : branchDetails?.BranchWeekDayClosed;

    const options = [];
    const isTomorrow =
      new Date(date).toISOString().split("T")[0] ===
      tomorrowDate.toISOString().split("T")[0];
    const openingHour = isTomorrow ? Math.max(startHour, 16) : startHour;

    for (let hour = openingHour; hour <= endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      options.push(timeString);
    }

    return options;
  }, [
    branchDetails?.BranchWeekDayClosed,
    branchDetails?.BranchWeekDayOpen,
    branchDetails?.BranchWeekEndClosed,
    branchDetails?.BranchWeekEndOpen,
    date,
    tomorrowDate,
  ]);

  const MAX_GUESTS_PER_HOUR = 100;

  const timeCapacity = useMemo(() => {
    const capacity = {};

    timeOptions.forEach((timeOption) => {
      const branchQuotaForTime = branchQuota
        ? branchQuota.find(
            (quota) =>
              quota.BranchQuotaTime === parseInt(timeOption.split(":")[0], 10)
          )
        : null;

      const maxGuests = branchQuotaForTime
        ? branchQuotaForTime.BranchQuotaPax
        : MAX_GUESTS_PER_HOUR;

      const totalGuests = reservations
        .filter(
          (reservation) =>
            formatDate(reservation.date) === formatDate(date) &&
            reservation.time === timeOption
        )
        .reduce((total, reservation) => {
          const guests = reservation.guest || 0;
          return total + guests;
        }, 0);

      const remainingGuests = maxGuests - totalGuests;
      capacity[timeOption] = remainingGuests > 0 ? remainingGuests : 0;
    });

    return capacity;
  }, [reservations, date, timeOptions, branchQuota]);

  const handleTimeSelect = (selectedTime) => {
    if (timeCapacity[selectedTime] > 0) {
      setTime(selectedTime);
      if (guest > timeCapacity[selectedTime]) {
        setGuest(timeCapacity[selectedTime]);
      }
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validasi form
      if (!name || !phone || !email || !guest || !time) {
        Swal.fire({
          icon: "warning",
          title: "Form Tidak Lengkap",
          text: "Harap isi semua kolom yang wajib diisi dan pilih waktu reservasi sebelum melanjutkan.",
        });
        return;
      }

      handleSaveData();

      if (guest > timeCapacity[time]) {
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
        branchName: branchDetails.BranchName,
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
          branchName: branchDetails.BranchName,
          date: formatDate(date),
          time: formatTime(time),
          guest: guest,
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

        // Simpan reservationId ke localStorage
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
      guest,
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
                value={guest}
                onChange={(e) => {
                  const inputGuest = e.target.value;
                  const formattedGuest = inputGuest.replace(/^0+/, "");

                  if (formattedGuest === "") {
                    setGuest("");
                  } else {
                    const numericGuest = Number(formattedGuest);
                    setGuest(numericGuest); // Set nilai tanpa memunculkan Swal
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
                dateFormat="dd/MM/yyyy"
                minDate={tomorrowDate}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-900 focus:border-purple-900 sm:text-sm"
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
                  {timeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`rounded-lg h-auto min-h-[50px] flex items-center justify-center ${
                        time === option
                          ? "bg-gray-300"
                          : timeCapacity[option] === 0
                          ? "bg-red-500 text-white cursor-not-allowed"
                          : timeCapacity[option] <= 20
                          ? "bg-yellow-500 text-white"
                          : "bg-purple-900 text-white"
                      }`}
                      onClick={() => handleTimeSelect(option)}
                      disabled={timeCapacity[option] === 0}
                    >
                      {option} <br />
                      {timeCapacity[option] <= 20 && timeCapacity[option] > 0
                        ? `Tersisa ${timeCapacity[option]}`
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

            <div className="max-h-60 overflow-y-auto border p-4 bg-gray-100 rounded-md mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Kebijakan Informasi Pelanggan:
              </h3>
              <div className="mt-2 text-gray-700 text-sm space-y-2">
                <p>
                  1. Kami menghargai privasi Anda. Informasi yang Anda berikan
                  melalui form ini hanya akan digunakan untuk keperluan
                  reservasi dan komunikasi terkait layanan restoran kami. Data
                  pribadi Anda tidak akan dibagikan kepada pihak ketiga tanpa
                  izin Anda.
                </p>
                <p>
                  2. Pastikan bahwa semua informasi yang Anda masukkan adalah
                  akurat dan lengkap. Informasi yang tidak tepat dapat
                  mempengaruhi proses reservasi dan pelayanan yang Anda terima.
                </p>
                <p>
                  3. Setelah Anda mengirimkan form, Anda akan menerima
                  konfirmasi reservasi melalui email atau telepon. Harap
                  pastikan bahwa alamat email dan nomor whatsapp yang Anda
                  berikan valid dan dapat dihubungi.
                </p>
                <p>
                  4. Untuk mengubah atau membatalkan reservasi, harap hubungi
                  kami langsung melalui telepon atau email yang tertera dalam
                  konfirmasi reservasi. Perubahan atau pembatalan harus
                  dilakukan minimal 24 jam sebelum waktu reservasi yang
                  dijadwalkan.
                </p>
                <p>
                  5. Dengan mengisi dan mengirimkan form ini, Anda setuju untuk
                  mematuhi kebijakan dan ketentuan yang berlaku di restoran
                  kami. Kami berhak untuk menolak reservasi jika tidak memenuhi
                  syarat atau jika terdapat pelanggaran terhadap kebijakan kami.
                </p>
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

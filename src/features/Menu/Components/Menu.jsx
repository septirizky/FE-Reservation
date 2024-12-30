import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "../../Components/Header";
import { getMenuBranch } from "../menuSlice";
import { getCategoryBranch } from "../categorySlice";
import { getOption, getOptionCategory, getOptionMenu } from "../optionSlice";
import { updateReservation } from "../../Reservation/reservationSlice";
import Swal from "sweetalert2";
import noImage from "../../../assets/no_image.jpg";
import { getPackage } from "../packageSlice";
import { getConfig } from "../../Config/configSlice";

export const Menu = () => {
  const { BranchCode, reservationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuBranch = useSelector((state) => state.menu.menuBranch);
  const categoryBranch = useSelector(
    (state) => state.category.categoriesBranch
  );
  const configData = useSelector((state) => state.config.config);

  const modalRef = useRef(null);
  const menuRef = useRef(null);
  const [isScrolledInModal, setIsScrolledInModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPackageModalVisible, setIsPackageModalVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedPackageOptions, setSelectedPackageOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isCartSummaryVisible, setIsCartSummaryVisible] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState("");
  // const [itemNote, setItemNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setFilteredSearchResults] = useState([]);
  const [isReadMore, setIsReadMore] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [checkboxOptions, setCheckboxOptions] = useState([]);
  const [served, setServed] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsImageModalVisible(true);
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
    setIsImageModalVisible(false);
  };

  const handleShowDetailModal = async (menu) => {
    if (menu.MenuSoldOut) {
      Swal.fire({
        icon: "warning",
        title: "Menu Tidak Tersedia",
        text: "Maaf, menu ini sudah habis.",
      });
      return;
    }

    if (menu.MenuPackage) {
      try {
        const response = await dispatch(getPackage(BranchCode));
        const packages = response.payload || [];

        // Cocokkan MenuName dengan PackageName
        const filteredPackages = packages.filter(
          (pkg) => pkg.PackageName === menu.MenuName
        );

        if (filteredPackages.length > 0) {
          setOptions(filteredPackages);
          setSelectedMenu(menu);
          setIsPackageModalVisible(true);
        } else {
          Swal.fire({
            icon: "error",
            title: "Paket Tidak Ditemukan",
            text: "Tidak ada paket yang tersedia untuk menu ini.",
          });
        }
      } catch (error) {
        console.error("Error fetching package data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal memuat data paket. Silakan coba lagi.",
        });
      }
    } else {
      try {
        const optionResponse = await dispatch(getOption());
        const options = optionResponse?.payload || [];

        const categoryExists = options.some(
          (option) => option.CategoryItemID === menu.CategoryItemID
        );
        const menuExists = options.some(
          (option) => option.MenusID === menu.MenusID
        );

        if (categoryExists || menuExists) {
          let combinedOptions = [];
          if (categoryExists) {
            const categoryResponse = await dispatch(
              getOptionCategory(menu.CategoryItemID)
            );
            const categoryOptions = categoryResponse?.payload || [];
            combinedOptions = [...combinedOptions, ...categoryOptions];
          }

          if (menuExists) {
            const menuResponse = await dispatch(getOptionMenu(menu.MenusID));
            const menuOptions = menuResponse?.payload || [];
            combinedOptions = [...combinedOptions, ...menuOptions];
          }

          setOptions(combinedOptions);
          setSelectedMenu(menu);
          setIsModalVisible(true);
        } else {
          setSelectedMenu(menu);
          setIsDetailModalVisible(true);
        }
      } catch (error) {
        console.error("Error checking options:", error);
      }
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
  };

  useEffect(() => {
    dispatch(getPackage(BranchCode));
    dispatch(getCategoryBranch(BranchCode));
    dispatch(getMenuBranch(BranchCode));
    dispatch(getConfig());
  }, [dispatch, BranchCode]);

  useEffect(() => {
    if (categoryBranch.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryBranch[0]);
    }
  }, [categoryBranch, selectedCategory]);

  useEffect(() => {
    const handleModalScroll = () => {
      if (modalRef.current) {
        const scrollTop = modalRef.current.scrollTop;
        setIsScrolledInModal(scrollTop > 0);
      }
    };

    // Aktifkan scroll listener hanya jika salah satu modal terlihat
    if (isModalVisible || isPackageModalVisible) {
      const timer = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.addEventListener("scroll", handleModalScroll);
        }
      }, 100); // Delay 100ms

      return () => {
        if (modalRef.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          modalRef.current.removeEventListener("scroll", handleModalScroll);
        }
        clearTimeout(timer);
      };
    }
  }, [isModalVisible, isPackageModalVisible]);

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.scrollTop = 0;
    }
  }, [selectedCategory]);

  const handleBack = useCallback(async () => {
    localStorage.removeItem("endTime");
    localStorage.removeItem("mainNote");
    localStorage.removeItem("cart");
    localStorage.removeItem("served");
    navigate(`/r/${BranchCode}`);
  }, [BranchCode, navigate]);

  useEffect(() => {
    const savedEndTime = localStorage.getItem("endTime");
    const currentTime = Date.now();

    // Jika ada waktu yang tersimpan di localStorage, gunakan itu untuk menghitung waktu tersisa
    if (savedEndTime) {
      const remainingTime = Math.floor(
        (parseInt(savedEndTime, 10) - currentTime) / 1000
      );
      setTimeLeft(remainingTime > 0 ? remainingTime : 0);
    } else {
      const newEndTime = currentTime + 3600 * 1000; // Set end time 60 minutes from now
      localStorage.setItem("endTime", newEndTime);
      setTimeLeft(3600);
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          Swal.fire({
            icon: "info",
            title: "Waktu Reservasi Habis",
            text: "Waktu reservasi sudah habis. Silahkan lakukan reservasi ulang.",
            confirmButtonText: "OK",
          }).then(() => {
            handleBack();
            localStorage.removeItem("endTime");
          });

          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleBack]);

  useEffect(() => {
    // Filter data untuk checkbox
    const filteredOptions = configData.filter(
      (item) => item.title === "DISAJIKAN" && item.show === true
    );
    setCheckboxOptions(filteredOptions);
  }, [configData]);

  const handleCheckboxChange = (option) => {
    setServed(option.content);
    localStorage.setItem("served", option.content);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const filteredMenu = menuBranch
    ? menuBranch.filter(
        (menu) => menu.CategoryName === selectedCategory?.CategoryName
      )
    : [];

  useEffect(() => {
    if (searchTerm) {
      const results = menuBranch.filter((menu) =>
        menu.MenuName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSearchResults(results);
    } else {
      setFilteredSearchResults([]);
    }
  }, [searchTerm, menuBranch]);

  const menuToDisplay = searchTerm
    ? menuBranch.filter((menu) =>
        menu.MenuName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredMenu;

  // Fungsi untuk menambah item ke keranjang setelah opsi dipilih
  const handlePackageSubmit = () => {
    if (selectedMenu) {
      // Filter dan tambahkan item AutoInsert ke selectedPackageOptions
      const autoInsertItems = options.filter((item) => item.AutoInsert);
      const updatedSelectedPackageOptions = [
        ...selectedPackageOptions,
        ...autoInsertItems,
      ];

      // Masukkan menu dan opsi yang dipilih (termasuk AutoInsert) ke keranjang
      addToCart(selectedMenu, updatedSelectedPackageOptions);

      // Reset state setelah proses selesai
      setSelectedPackageOptions([]);
      setIsPackageModalVisible(false);
    }
  };

  const handleClosePackageModal = () => {
    setIsPackageModalVisible(false);
    setSelectedPackageOptions([]);
  };

  // Fungsi untuk menambah item ke keranjang
  const addToCart = (menu, options) => {
    const existingItem = cart.find(
      (item) =>
        item.MenuName === menu.MenuName &&
        JSON.stringify(item.options) === JSON.stringify(options)
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.MenuName === menu.MenuName &&
        JSON.stringify(item.options) === JSON.stringify(options)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          ...menu,
          quantity: 1,
          options,
          CookingCharge: menu.CookingCharge,
          MenuPackage: menu.MenuPackage,
        },
      ];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const savedServed = localStorage.getItem("served");
    if (savedServed) {
      setServed(savedServed);
    }

    const savedNote = localStorage.getItem("mainNote");
    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  const getTotalItemsPerMenu = (menuName) => {
    return cart
      .filter((item) => item.MenuName === menuName)
      .reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    if (selectedCartItem) {
      const updatedCartItem = cart.find(
        (item) =>
          item.MenuName === selectedCartItem.MenuName &&
          JSON.stringify(item.options) ===
            JSON.stringify(selectedCartItem.options)
      );

      if (updatedCartItem) {
        setSelectedCartItem(updatedCartItem);
      }
    }
  }, [cart, selectedCartItem]);

  // Fungsi untuk menampilkan modal jika menu memiliki opsi
  const handleTambahClick = async (e, menu) => {
    e.preventDefault();
    setSelectedMenu(menu);

    if (menu.MenuPackage) {
      try {
        // Fetch data package berdasarkan BranchCode
        const response = await dispatch(getPackage(BranchCode));
        const packages = response.payload || [];

        // Cocokkan MenuName dengan PackageName
        const filteredPackages = packages.filter(
          (pkg) => pkg.PackageName === menu.MenuName
        );

        if (filteredPackages.length > 0) {
          setOptions(filteredPackages); // Simpan opsi package
          setIsPackageModalVisible(true); // Tampilkan modal package
        } else {
          Swal.fire({
            icon: "error",
            title: "Paket Tidak Ditemukan",
            text: "Tidak ada paket yang tersedia untuk menu ini.",
          });
        }
      } catch (error) {
        console.error("Error fetching package data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal memuat data paket. Silakan coba lagi.",
        });
      }
    } else {
      // Logika untuk menu tanpa package (MenuPackage = false)
      try {
        const optionResponse = await dispatch(getOption());
        const options = optionResponse?.payload || [];

        const categoryExists = options.some(
          (option) => option.CategoryItemID === menu.CategoryItemID
        );
        const menuExists = options.some(
          (option) => option.MenusID === menu.MenusID
        );

        if (categoryExists || menuExists) {
          let combinedOptions = [];
          if (categoryExists) {
            const categoryResponse = await dispatch(
              getOptionCategory(menu.CategoryItemID)
            );
            const categoryOptions = categoryResponse?.payload || [];
            combinedOptions = [...combinedOptions, ...categoryOptions];
          }

          if (menuExists) {
            const menuResponse = await dispatch(getOptionMenu(menu.MenusID));
            const menuOptions = menuResponse?.payload || [];
            combinedOptions = [...combinedOptions, ...menuOptions];
          }

          setOptions(combinedOptions);
          setIsModalVisible(true);
        } else {
          addToCart(menu, []);
        }
      } catch (error) {
        console.error("Error checking options:", error);
      }
    }
  };

  const handleShowCartItemDetails = (item) => {
    setSelectedCartItem(item);
  };

  // Fungsi untuk menampilkan ringkasan keranjang
  const handleShowCartSummary = () => {
    setIsCartSummaryVisible(true); // Tampilkan modal ringkasan keranjang
  };

  // Fungsi untuk menyembunyikan ringkasan keranjang
  const handleCloseCartSummary = () => {
    setIsCartSummaryVisible(false); // Sembunyikan modal ringkasan keranjang
  };

  // Fungsi untuk menambah quantity di keranjang dan modal
  const handleIncreaseQuantity = (menu) => {
    const updatedCart = cart.map((item) =>
      item.MenuName === menu.MenuName &&
      JSON.stringify(item.options) === JSON.stringify(menu.options)
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Jika ada item yang dipilih di modal keranjang, perbarui juga
    if (selectedCartItem) {
      setSelectedCartItem((prevItem) => ({
        ...prevItem,
        quantity: prevItem.quantity + 1,
      }));
    }
  };

  // Fungsi untuk mengurangi quantity di keranjang dan modal
  const handleDecreaseQuantity = (menu) => {
    const existingItem = cart.find(
      (item) =>
        item.MenuName === menu.MenuName &&
        JSON.stringify(item.options || []) ===
          JSON.stringify(menu.options || [])
    );

    if (existingItem && existingItem.quantity === 1) {
      // Jika quantity 1, hapus item dari keranjang
      const updatedCart = cart.filter(
        (item) =>
          !(
            item.MenuName === menu.MenuName &&
            JSON.stringify(item.options || []) ===
              JSON.stringify(menu.options || [])
          )
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setSelectedCartItem(null);
    } else if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.MenuName === menu.MenuName &&
        JSON.stringify(item.options || []) ===
          JSON.stringify(menu.options || [])
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const handleShowOptionModal = async (item) => {
    setSelectedOptions([]);
    setSelectedMenu(item);

    if (item.MenuPackage) {
      try {
        const response = await dispatch(getPackage(BranchCode));
        const packages = response.payload || [];
        const filteredPackages = packages.filter(
          (pkg) => pkg.PackageName === item.MenuName
        );

        if (filteredPackages.length > 0) {
          setOptions(filteredPackages);
          setIsPackageModalVisible(true);
          return;
        } else {
          Swal.fire({
            icon: "error",
            title: "Paket Tidak Ditemukan",
            text: "Tidak ada paket yang tersedia untuk menu ini.",
          });
        }
      } catch (error) {
        console.error("Error fetching package data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal memuat data paket. Silakan coba lagi.",
        });
      }
    } else {
      try {
        const optionResponse = await dispatch(getOption());
        const options = optionResponse?.payload || [];
        const categoryExists = options.some(
          (option) => option.CategoryItemID === item.CategoryItemID
        );
        const menuExists = options.some(
          (option) => option.MenusID === item.MenusID
        );

        let combinedOptions = [];
        if (categoryExists) {
          const categoryResponse = await dispatch(
            getOptionCategory(item.CategoryItemID)
          );
          const categoryOptions = categoryResponse?.payload || [];
          combinedOptions = [...combinedOptions, ...categoryOptions];
        }

        if (menuExists) {
          const menuResponse = await dispatch(getOptionMenu(item.MenusID));
          const menuOptions = menuResponse?.payload || [];
          combinedOptions = [...combinedOptions, ...menuOptions];
        }

        setOptions(combinedOptions);
        setIsModalVisible(true);
      } catch (error) {
        console.error("Error loading options:", error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOptions([]);
  };

  const handleOptionSubmit = () => {
    if (selectedMenu) {
      addToCart(selectedMenu, selectedOptions);
      setSelectedOptions([]);
      setIsModalVisible(false);
    }
  };

  // const updateItemNote = (menuName, options, newNote) => {
  //   const updatedCart = cart.map((item) =>
  //     item.MenuName === menuName &&
  //     JSON.stringify(item.options) === JSON.stringify(options)
  //       ? { ...item, itemNote: newNote }
  //       : item
  //   );
  //   setCart(updatedCart);
  //   localStorage.setItem("cart", JSON.stringify(updatedCart));
  // };

  useEffect(() => {
    if (isModalVisible || isCartSummaryVisible || isDetailModalVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalVisible, isCartSummaryVisible, isDetailModalVisible]);

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    localStorage.setItem("mainNote", newNote);
  };

  const formatRp = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace("Rp", "Rp ");
  };

  const formatRupiah = (number) =>
    number.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const calculateTotalItems = () => {
    return cart.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  };

  const calculateItemTotalPrice = () => {
    return cart.reduce((total, item) => {
      // Hitung total harga opsi (ItemPackageDetailPrice) jika ada
      const optionPrice = item.options.reduce((optTotal, option) => {
        return optTotal + (option.ItemPackageDetailPrice || 0);
      }, 0);

      // Hitung total harga menu (MenuPrice + opsi)
      const itemTotal = (item.MenuPrice + optionPrice) * item.quantity;

      return total + itemTotal;
    }, 0);
  };

  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.OptionText]) {
      acc[option.OptionText] = [];
    }
    acc[option.OptionText].push(option);
    return acc;
  }, {});

  const groupedPackages = options.reduce((acc, pkg) => {
    if (!acc[pkg.OptionPackage]) {
      acc[pkg.OptionPackage] = [];
    }
    acc[pkg.OptionPackage].push(pkg);
    return acc;
  }, {});

  const handleCheckout = async () => {
    if (!served) {
      Swal.fire({
        icon: "warning",
        title: "Opsi Penyajian Belum Dipilih",
        text: "Harap pilih opsi penyajian sebelum melanjutkan.",
      });
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    const amount = calculateItemTotalPrice();

    const orderData = {
      amount: Math.round(amount),
      note: note,
      served: served,
      items: cart.map((item) => {
        if (item.MenuPackage) {
          return {
            i_id: item.i_id,
            MenuName: item.MenuName,
            CategoryName: item.CategoryName,
            ItemDetails: item.options.map((opt) => ({
              ItemChild_i_id: opt.ItemChild_i_id,
              ItemPackageDetail: opt.ItemPackageDetail,
              ItemOptionPackage: opt.ItemOptionPackage,
              Package_op_id: opt.Package_op_id,
              ItemPackageDetailQty: item.quantity,
              ItemPackageDetailPrice: opt.ItemPackageDetailPrice,
            })),
            MenuPrice: item.MenuPrice,
            CookingCharge: item.CookingCharge,
            quantities: item.quantity,
          };
        } else {
          return {
            i_id: item.i_id,
            CategoryName: item.CategoryName,
            MenuName: item.MenuName,
            OptionName: item.options.map((opt) => opt.OptionName).join(", "),
            op_id: item.options
              .map((opt) => parseInt(opt.op_id, 10))
              .join(", "),
            MenuPrice: item.MenuPrice,
            CookingCharge: item.CookingCharge,
            quantities: item.quantity,
          };
        }
      }),
    };

    try {
      Swal.fire({
        title: "Memproses...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await dispatch(updateReservation({ reservationId, orderData })).unwrap();
      navigate(`/r/${BranchCode}/${reservationId}/confirmation`);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal membuat pesanan. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false); // Kembalikan status loading ke false setelah selesai
      Swal.close(); // Tutup modal loading Swal
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header onBack={handleBack} onSearchChange={setSearchTerm} />
        <div className="w-full bg-yellow-500 text-center text-white py-1 px-3">
          <span>Waktu pesan anda tersisa: {formatTime(timeLeft)}</span>
        </div>
        <div className="bg-white rounded-lg pt-2 w-full">
          <div className="bg-white rounded-lg px-1 w-full mb-20">
            <div className="flex">
              {/* Sidebar Kategori */}
              <div className="w-1/4 items-center border-gray-300 overflow-y-auto bg-gray-50">
                <div className="w-full max-w-4xl max-h-screen overflow-auto p-2">
                  <ul className="space-y-2">
                    {categoryBranch &&
                      categoryBranch.map((category, index) => (
                        <li
                          key={index}
                          onClick={() => setSelectedCategory(category)}
                          className={`cursor-pointer py-2 flex flex-col shadow-sm items-center space-y-2 rounded-lg ${
                            selectedCategory?.CategoryName ===
                            category.CategoryName
                              ? "bg-gray-200"
                              : "bg-white"
                          } hover:bg-gray-100`}
                        >
                          <img
                            src={category.CategoryImage || noImage}
                            alt={category.CategoryName}
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-full"
                          />
                          <span className="text-center text-xs sm:text-sm md:text-base font-medium">
                            {category.CategoryName}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Menu Items */}
              <div
                ref={menuRef}
                className="w-3/4 flex flex-col items-center overflow-y-auto"
              >
                <div className="w-full max-w-4xl max-h-screen pl-1 pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    {menuToDisplay.map((menu, index) => {
                      const cartItem = cart.find(
                        (item) => item.MenuName === menu.MenuName
                      );

                      return (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg shadow-sm bg-white leading-tight min-h-[250px] flex flex-col justify-between ${
                            menu.MenuSoldOut ? "opacity-50" : ""
                          }`}
                        >
                          <img
                            src={menu.MenusImage || noImage}
                            alt={menu.MenuName}
                            className={`w-full sm:h-20 md:h-36 object-cover rounded-lg mb-4 ${
                              menu.MenuSoldOut
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                            }`}
                            onClick={() =>
                              !menu.MenuSoldOut && handleShowDetailModal(menu)
                            }
                          />

                          <div className="flex-grow">
                            <span className="text-sm sm:text-sm md:text-base font-medium">
                              {menu.MenuName}
                            </span>
                            <br />
                            <span className="text-xs text-gray-500 sm:text-xs md:text-base">
                              {menu.Description.length > 35
                                ? `${menu.Description.substring(0, 35)}...`
                                : menu.Description}
                            </span>
                          </div>

                          <div className="flex flex-col mt-1">
                            <span className="text-sm sm:text-sm md:text-base font-bold">
                              {formatRp(menu.MenuPrice)}
                            </span>

                            {menu.MenuSoldOut ? (
                              <span className="block text-red-700 font-bold mt-1">
                                Sold Out
                              </span>
                            ) : (
                              <div className="flex items-center justify-center font-semibold mt-1">
                                {cartItem ? (
                                  cartItem.options.length > 0 ? (
                                    <div className="flex flex-col items-center">
                                      <button
                                        className="px-4 py-2 bg-purple-900 text-white rounded-lg"
                                        onClick={() =>
                                          handleShowCartItemDetails(cartItem)
                                        }
                                      >
                                        {getTotalItemsPerMenu(menu.MenuName)}{" "}
                                        Items
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                      <button
                                        onClick={() =>
                                          handleDecreaseQuantity(menu)
                                        }
                                        className="w-6 h-6 flex items-center justify-center bg-purple-900 text-white rounded"
                                      >
                                        -
                                      </button>
                                      <span className="text-sm text-center w-6">
                                        {cartItem.quantity}
                                      </span>
                                      <button
                                        onClick={(e) =>
                                          handleTambahClick(e, menu)
                                        }
                                        className="w-6 h-6 flex items-center justify-center bg-purple-900 text-white rounded"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )
                                ) : (
                                  <button
                                    onClick={(e) => handleTambahClick(e, menu)}
                                    className="px-4 py-2 bg-purple-900 text-white rounded-lg mt-1"
                                  >
                                    Tambah
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Opsi */}
          {isModalVisible && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
              <div
                ref={modalRef}
                className="bg-white max-w-3xl w-full h-full flex flex-col justify-between rounded-lg shadow-lg overflow-y-auto"
              >
                <div className="bg-purple-900 py-3 text-white w-full flex justify-start items-center px-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex items-center space-x-2 font-semibold text-xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Kembali</span>
                  </button>
                </div>

                {isScrolledInModal && (
                  <div className="sticky top-0 bg-white py-4 z-10">
                    <h4 className="text-xl font-semibold text-center">
                      {selectedMenu?.MenuName}
                    </h4>
                  </div>
                )}

                {/* Tampilkan gambar menu di atas "Pilih Saus?" */}
                {selectedMenu && (
                  <div className="flex flex-col items-center px-6 mt-4">
                    <img
                      src={selectedMenu.MenusImage || noImage}
                      alt={selectedMenu.MenuName}
                      className="w-48 h-48 object-cover rounded-lg mb-4 cursor-pointer"
                      onClick={() =>
                        handleImageClick(selectedMenu.MenusImage || noImage)
                      }
                    />

                    <div className="w-full flex justify-between text-xl font-semibold">
                      <span>{selectedMenu.MenuName}</span>
                      <span>{formatRp(selectedMenu.MenuPrice)}</span>
                    </div>
                    {/* Logika untuk "Read More" pada deskripsi */}
                    <span className="text-gray-500 text-sm text-justify">
                      {isReadMore ? (
                        <>
                          {selectedMenu.Description}
                          <button
                            className="text-purple-700 font-semibold ml-1"
                            onClick={() => setIsReadMore(false)}
                          >
                            Show less
                          </button>
                        </>
                      ) : (
                        <>
                          {selectedMenu.Description.substring(0, 200)}...
                          <button
                            className="text-purple-700 font-semibold"
                            onClick={() => setIsReadMore(true)}
                          >
                            Read more
                          </button>
                        </>
                      )}
                    </span>
                  </div>
                )}

                <div className="w-full px-6 pt-6 flex-grow">
                  <div>
                    {Object.keys(groupedOptions).map((OptionText, index) => (
                      <div key={index} className="mb-4 w-full">
                        <h4 className="text-lg font-semibold mb-2">
                          {OptionText}
                        </h4>
                        <div className="space-y-4">
                          {groupedOptions[OptionText].map(
                            (option, optIndex) => (
                              <div
                                key={optIndex}
                                className="flex justify-between items-center border-b border-gray-200 pb-2"
                              >
                                <label className="flex items-center w-full cursor-pointer">
                                  <span className="text-base font-medium flex-grow">
                                    {option.OptionName}
                                  </span>
                                  <span className="text-gray-500 mr-2">
                                    Gratis
                                  </span>
                                  <input
                                    type="radio"
                                    name={OptionText}
                                    value={option.OptionName}
                                    checked={selectedOptions.some(
                                      (selected) =>
                                        selected.OptionsID ===
                                          option.OptionsID &&
                                        selected.OptionText === OptionText
                                    )}
                                    onChange={() =>
                                      setSelectedOptions((prevOptions) => {
                                        const updatedOptions =
                                          prevOptions.filter(
                                            (selected) =>
                                              selected.OptionText !== OptionText
                                          );
                                        return [
                                          ...updatedOptions,
                                          { ...option, OptionText },
                                        ];
                                      })
                                    }
                                    className="radio h-5 w-5 accent-purple-900"
                                  />
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tombol Tambah ke Keranjang di bagian bawah */}
                <div className="sticky bottom-0 w-full bg-white p-4 flex justify-center">
                  <button
                    className={`w-80 py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 ${
                      Object.keys(groupedOptions).every((OptionText) =>
                        selectedOptions.some(
                          (selected) => selected.OptionText === OptionText
                        )
                      )
                        ? "bg-purple-900 text-white"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                    onClick={handleOptionSubmit}
                    disabled={
                      !Object.keys(groupedOptions).every((OptionText) =>
                        selectedOptions.some(
                          (selected) => selected.OptionText === OptionText
                        )
                      )
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3h2l.4 2M7 13h10l3.5-7H6.6L5.2 3H3m5 10V7H3v6h5zm3 3a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Tambah ke Keranjang</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPackageModalVisible && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
              <div
                ref={modalRef}
                className="bg-white max-w-3xl w-full h-full flex flex-col justify-between rounded-lg shadow-lg overflow-y-auto"
              >
                {/* Header Modal */}
                <div className="bg-purple-900 py-3 text-white w-full flex justify-start items-center px-4">
                  <button
                    type="button"
                    onClick={handleClosePackageModal}
                    className="flex items-center space-x-2 font-semibold text-xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Kembali</span>
                  </button>
                </div>

                {isScrolledInModal && (
                  <div className="sticky top-0 bg-white py-4 z-10">
                    <h4 className="text-xl font-semibold text-center">
                      {selectedMenu.MenuName}
                    </h4>
                  </div>
                )}

                {selectedMenu && (
                  <div className="flex flex-col items-center px-6 mt-4">
                    <img
                      src={selectedMenu.MenusImage || noImage}
                      alt={selectedMenu.MenuName}
                      className="w-48 h-48 object-cover rounded-lg mb-4 cursor-pointer"
                      onClick={() =>
                        handleImageClick(selectedMenu.MenusImage || noImage)
                      }
                    />
                    <div className="w-full flex justify-between text-xl font-semibold">
                      <span>{selectedMenu.MenuName}</span>
                      <span>{formatRp(selectedMenu.MenuPrice)}</span>
                    </div>
                    <span className="text-gray-500 text-sm text-justify">
                      {isReadMore ? (
                        <>
                          {selectedMenu.Description}
                          <button
                            className="text-purple-700 font-semibold ml-1"
                            onClick={() => setIsReadMore(false)}
                          >
                            Show less
                          </button>
                        </>
                      ) : (
                        <>
                          {selectedMenu.Description.substring(0, 200)}...
                          <button
                            className="text-purple-700 font-semibold ml-1"
                            onClick={() => setIsReadMore(true)}
                          >
                            Read more
                          </button>
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* Opsi Paket */}
                <div className="w-full px-6 pt-6 flex-grow">
                  <div className="w-full px-6 pt-6 flex-grow">
                    <div>
                      {Object.keys(groupedPackages).map(
                        (OptionPackage, index) => (
                          <div key={index} className="mb-4 w-full">
                            {/* Cek apakah semua opsi dalam package adalah AutoInsert */}
                            {groupedPackages[OptionPackage].every(
                              (option) => option.AutoInsert
                            ) ? (
                              <div className="text-lg font-semibold mb-2">
                                {OptionPackage}
                              </div>
                            ) : (
                              <div className="text-lg font-semibold mb-2">
                                {OptionPackage}
                                <span className="text-xs text-purple-700 font-semibold ml-1">
                                  (Pilih min.{" "}
                                  {groupedPackages[OptionPackage][0]
                                    ?.MinChoosen || 0}
                                  ) (Pilih maks.{" "}
                                  {groupedPackages[OptionPackage][0]
                                    ?.MaxChoosen || 1}
                                  )
                                </span>
                              </div>
                            )}

                            {/* Tampilkan item AutoInsert */}
                            <div className="space-y-2">
                              {groupedPackages[OptionPackage].filter(
                                (option) => option.AutoInsert
                              ).map((autoItem, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center border-b border-gray-200 pb-2"
                                >
                                  <span className="text-base font-medium flex-grow">
                                    {autoItem.AltMenuName ||
                                      autoItem.ItemPackageDetail}
                                  </span>
                                  <span className="text-gray-500">
                                    {autoItem.ItemPackageDetailPrice === 0
                                      ? "Gratis"
                                      : `+${formatRupiah(
                                          autoItem.ItemPackageDetailPrice
                                        )}`}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Tampilkan item manual */}
                            <div className="space-y-4">
                              {groupedPackages[OptionPackage].filter(
                                (option) => !option.AutoInsert
                              ).map((detail, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center border-b border-gray-200 pb-2"
                                >
                                  <label className="flex items-center w-full cursor-pointer">
                                    <span className="text-base font-medium flex-grow">
                                      {detail.AltMenuName ||
                                        detail.ItemPackageDetail}
                                    </span>
                                    <span className="text-gray-500 mr-2">
                                      {detail.ItemPackageDetailPrice === 0
                                        ? "Gratis"
                                        : `+${formatRupiah(
                                            detail.ItemPackageDetailPrice
                                          )}`}
                                    </span>
                                    <input
                                      type="checkbox"
                                      value={detail.ItemPackageDetailID}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setSelectedPackageOptions((prev) => {
                                          const currentCategoryOptions =
                                            prev.filter(
                                              (opt) =>
                                                opt.OptionPackage ===
                                                detail.OptionPackage
                                            );
                                          if (isChecked) {
                                            if (
                                              currentCategoryOptions.length <
                                              detail.MaxChoosen
                                            ) {
                                              return [...prev, detail];
                                            } else {
                                              Swal.fire({
                                                icon: "warning",
                                                title: "Maksimal Opsi Terpilih",
                                                text: `Anda hanya dapat memilih ${detail.MaxChoosen} opsi untuk paket ini.`,
                                              });
                                              return prev;
                                            }
                                          }
                                          return prev.filter(
                                            (opt) =>
                                              opt.ItemPackageDetailID !==
                                              detail.ItemPackageDetailID
                                          );
                                        });
                                      }}
                                      checked={selectedPackageOptions.some(
                                        (opt) =>
                                          opt.ItemPackageDetailID ===
                                          detail.ItemPackageDetailID
                                      )}
                                      className="checkbox accent-purple-900"
                                    />
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Tombol Tambah ke Keranjang */}
                <div className="sticky bottom-0 w-full bg-white p-4 flex justify-center">
                  <button
                    onClick={handlePackageSubmit}
                    className={`w-80 py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 ${
                      Object.keys(groupedPackages).every((OptionPackage) =>
                        groupedPackages[OptionPackage].filter(
                          (option) => !option.AutoInsert
                        ) // Hanya opsi dengan AutoInsert = false
                          .every((option) =>
                            selectedPackageOptions.some(
                              (selected) =>
                                selected.OptionPackage === OptionPackage &&
                                groupedPackages[OptionPackage].filter(
                                  (opt) =>
                                    opt.OptionPackage === OptionPackage &&
                                    !opt.AutoInsert && // Pastikan opsi manual saja
                                    selectedPackageOptions.includes(opt)
                                ).length >=
                                  groupedPackages[OptionPackage][0]
                                    ?.MinChoosen &&
                                groupedPackages[OptionPackage].filter(
                                  (opt) =>
                                    opt.OptionPackage === OptionPackage &&
                                    !opt.AutoInsert && // Pastikan opsi manual saja
                                    selectedPackageOptions.includes(opt)
                                ).length <= option.MaxChoosen
                            )
                          )
                      )
                        ? "bg-purple-900 text-white"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                    disabled={
                      !Object.keys(groupedPackages).every((OptionPackage) =>
                        groupedPackages[OptionPackage].filter(
                          (option) => !option.AutoInsert
                        ) // Hanya opsi dengan AutoInsert = false
                          .every((option) =>
                            selectedPackageOptions.some(
                              (selected) =>
                                selected.OptionPackage === OptionPackage &&
                                groupedPackages[OptionPackage].filter(
                                  (opt) =>
                                    opt.OptionPackage === OptionPackage &&
                                    !opt.AutoInsert && // Pastikan opsi manual saja
                                    selectedPackageOptions.includes(opt)
                                ).length >=
                                  groupedPackages[OptionPackage][0]
                                    ?.MinChoosen &&
                                groupedPackages[OptionPackage].filter(
                                  (opt) =>
                                    opt.OptionPackage === OptionPackage &&
                                    !opt.AutoInsert && // Pastikan opsi manual saja
                                    selectedPackageOptions.includes(opt)
                                ).length <= option.MaxChoosen
                            )
                          )
                      )
                    }
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Keranjang */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 w-full left-1/2 transform -translate-x-1/2 px-6 bg-purple-900 text-white font-semibold flex justify-between items-center max-w-md shadow-lg">
              <div className="bg-purple-900 text-white py-2 px-4 rounded-l-lg">
                <span className="block text-sm">
                  {calculateTotalItems()} Items
                </span>
                <span className="block text-md">
                  {formatRp(calculateItemTotalPrice())}
                </span>
              </div>
              <button
                className="flex bg-white text-purple-900 py-2 px-4 rounded-full items-center space-x-2"
                onClick={handleShowCartSummary} // Tampilkan modal ringkasan keranjang
              >
                <span>Lihat Pesanan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ringkasan Keranjang */}
      {isCartSummaryVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-3xl h-full flex flex-col justify-between rounded-lg shadow-lg">
            <div className="bg-purple-900 py-3 text-white w-full flex justify-start items-center px-4">
              <button
                type="button"
                onClick={handleCloseCartSummary}
                className="flex items-center space-x-2 font-semibold text-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Kembali</span>
              </button>
            </div>

            {/* Daftar item dalam keranjang */}
            <div className="w-full p-3 overflow-y-auto flex-grow">
              <div className="p-4 border-b">
                <h2 className="text-lg text-center font-bold">
                  Ringkasan Pesanan
                </h2>
              </div>

              <div className="space-y-4 m-3 leading-tight">
                {cart.map((item, index) => (
                  <div key={index} className="mb-4 border-b pb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-grow w-1/2 pr-2">
                        <span className="font-semibold text-sm block">
                          {item.MenuName}
                        </span>
                        {item.options.length > 0 && (
                          <ul className="text-xs text-gray-500 list-disc ml-4">
                            {item.options.map((opt, idx) => (
                              <li key={idx}>
                                {opt.ItemPackageDetail || opt.OptionName}
                                {opt.ItemPackageDetailPrice > 0 &&
                                  `(+${formatRupiah(
                                    opt.ItemPackageDetailPrice
                                  )})`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex items-center justify-center space-x-2 w-1/4">
                        <button
                          onClick={() => handleDecreaseQuantity(item)}
                          className="w-6 h-6 flex items-center justify-center bg-purple-900 text-white rounded"
                        >
                          -
                        </button>
                        <span className="text-sm text-center w-6">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(item)}
                          className="w-6 h-6 flex items-center justify-center bg-purple-900 text-white rounded"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center w-1/4 justify-end">
                        <span className="text-sm text-right ml-1 font-semibold">
                          {formatRupiah(
                            (item.MenuPrice +
                              item.options.reduce(
                                (total, option) =>
                                  total + (option.ItemPackageDetailPrice || 0),
                                0
                              )) *
                              item.quantity
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Input untuk catatan item di bawah setiap item */}
                    {/* <div className="flex items-center mt-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-black"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h18M3 3v18M3 21h18M21 3v18M7 3h10m-3 6H7m-2 0h8m2 0h4"
                        />
                      </svg>
                      <input
                        type="text"
                        value={item.itemNote || ""}
                        onChange={(e) =>
                          updateItemNote(
                            item.MenuName,
                            item.options,
                            e.target.value
                          )
                        }
                        placeholder="Catatan item (Tidak wajib)"
                        className="text-sm border rounded px-2 py-1 w-full"
                      />
                    </div> */}
                  </div>
                ))}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="w-full p-2 bg-white rounded-md shadow-lg">
                <h2 className="text-lg text-center font-bold">
                  Pilih Opsi Penyajian
                </h2>

                {checkboxOptions.map((option, index) => (
                  <div key={index} className="flex items-center px-2">
                    <input
                      type="checkbox"
                      id={`checkbox-${index}`}
                      name="disajikan-option"
                      value={option.content}
                      checked={served === option.content}
                      onChange={() => handleCheckboxChange(option)}
                      className="checkbox accent-purple-900"
                    />
                    <label
                      htmlFor={`checkbox-${index}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option.content}
                    </label>
                  </div>
                ))}

                <div className="bg-white px-2 border-t">
                  <label className="block text-md font-semibold">Note :</label>
                  <div className="flex items-center border border-black rounded-lg px-3 py-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5 mr-2 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h18M3 3v18M3 21h18M21 3v18M7 3h10m-3 6H7m-2 0h8m2 0h4"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Catatan pesanan"
                      className="w-full outline-none text-sm text-black"
                      value={note}
                      onChange={handleNoteChange}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 bg-white flex items-center justify-between">
              <div className="py-2">
                <span className="block font-semibold text-sm">
                  {calculateTotalItems()} Items
                </span>
                <span className="block font-semibold text-md">
                  {formatRp(calculateItemTotalPrice())}
                </span>
              </div>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-purple-900 text-white"
                }`}
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Menu */}
      {selectedCartItem && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-3xl h-full flex flex-col justify-between rounded-lg shadow-lg">
            <div className="bg-purple-900 py-3 text-white w-full flex justify-start items-center px-4">
              <button
                type="button"
                onClick={() => setSelectedCartItem(null)}
                className="flex items-center space-x-2 font-semibold text-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Kembali</span>
              </button>
            </div>

            <div className="w-full p-3 overflow-y-auto flex-grow">
              <div className="p-4 border-b">
                <h2 className="text-lg text-center font-bold">
                  Ringkasan Pesanan
                </h2>
              </div>

              <div className="space-y-4 m-3">
                {cart
                  .filter((item) => item.MenuName === selectedCartItem.MenuName)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center mb-2 border-b pb-2"
                    >
                      <div className="flex-grow">
                        <span className="font-semibold text-lg">
                          {item.MenuName}
                        </span>
                        <br />
                        {item.options.length > 0 && (
                          <ul className="text-xs text-gray-500 list-disc ml-4">
                            {item.options.map((opt, index) => (
                              <li key={index}>
                                {opt.ItemPackageDetail || opt.OptionName}{" "}
                                {/* Tampilkan opsi/paket */}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 w-20">
                        <button
                          onClick={() => handleDecreaseQuantity(item)}
                          className="px-2 py-1 bg-purple-900 text-white rounded"
                        >
                          -
                        </button>
                        <span className="text-center w-8">{item.quantity}</span>
                        <button
                          onClick={() => handleIncreaseQuantity(item)}
                          className="px-2 py-1 bg-purple-900 text-white rounded"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-semibold ml-4 w-5">
                        <h3>Rp</h3>
                      </div>

                      <div className="text-right w-20">
                        <span className="font-semibold">
                          {formatRupiah(
                            (item.MenuPrice +
                              item.options.reduce(
                                (total, option) =>
                                  total + (option.ItemPackageDetailPrice || 0),
                                0
                              )) *
                              item.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tombol Opsi Lain di bagian bawah */}
            <div className="bg-white p-3 w-full">
              <button
                className="w-full px-4 py-2 bg-purple-900 text-white font-semibold rounded-lg"
                onClick={() => {
                  handleShowOptionModal(selectedCartItem);
                  setSelectedCartItem(null);
                }}
              >
                Opsi Lain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Menu */}
      {isDetailModalVisible && selectedMenu && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-3xl h-full flex flex-col rounded-lg shadow-lg">
            {/* Header Modal */}
            <div className="bg-purple-900 py-3 text-white w-full flex justify-start items-center px-4">
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="flex items-center space-x-2 font-semibold text-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Kembali</span>
              </button>
            </div>

            {/* Isi Modal */}
            <div className="flex flex-col mt-4 items-center px-6 flex-grow overflow-y-auto">
              <img
                src={selectedMenu.MenusImage || noImage}
                alt={selectedMenu.MenuName}
                className="w-48 h-48 object-cover rounded-lg mb-4 cursor-pointer"
                onClick={() =>
                  handleImageClick(selectedMenu.MenusImage || noImage)
                }
              />

              <div className="w-full flex justify-between text-xl font-semibold">
                <span>{selectedMenu.MenuName}</span>
                <span>{formatRp(selectedMenu.MenuPrice)}</span>
              </div>
              <span className="text-gray-500 text-sm text-justify">
                {selectedMenu.Description.length > 200 ? (
                  isReadMore ? (
                    <>
                      {selectedMenu.Description}
                      <button
                        className="text-purple-700 font-semibold ml-1"
                        onClick={() => setIsReadMore(false)}
                      >
                        Show less
                      </button>
                    </>
                  ) : (
                    <>
                      {selectedMenu.Description.substring(0, 200)}...
                      <button
                        className="text-purple-700 font-semibold"
                        onClick={() => setIsReadMore(true)}
                      >
                        Read more
                      </button>
                    </>
                  )
                ) : (
                  selectedMenu.Description
                )}
              </span>
            </div>

            {/* Tombol Tambah ke Keranjang */}
            <div className="sticky bottom-0 w-full bg-white p-4 flex justify-center">
              <button
                onClick={() => {
                  handleOptionSubmit();
                  handleCloseDetailModal();
                }}
                className="w-80 bg-purple-900 text-white py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3h2l.4 2M7 13h10l3.5-7H6.6L5.2 3H3m5 10V7H3v6h5zm3 3a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Tambah ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isImageModalVisible && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={(e) => {
            // Tutup modal hanya jika area yang diklik adalah latar belakang, bukan gambar
            if (e.target === e.currentTarget) {
              handleCloseImageModal();
            }
          }}
        >
          <button
            onClick={handleCloseImageModal}
            className="absolute top-5 right-5 text-white text-2xl font-bold z-10"
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Detail Gambar"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};

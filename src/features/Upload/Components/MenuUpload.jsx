import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getMenuBranch } from "../../Menu/menuSlice";
import API from "../../API/Api";

export default function MenuUpload() {
  const { BranchCode } = useParams();
  const dispatch = useDispatch();

  const menusBranch = useSelector((state) => state.menu.menuBranch);

  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Ambil data menu berdasarkan BranchCode
    const fetchMenus = async () => {
      try {
        await dispatch(getMenuBranch(BranchCode)).unwrap();
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };
    fetchMenus();
  }, [BranchCode, dispatch]);

  const updateImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      Swal.fire("Error", "Silakan pilih gambar terlebih dahulu!", "error");
      return;
    }

    if (!selectedMenu) {
      Swal.fire("Error", "Silakan pilih menu terlebih dahulu!", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", image);
      setImageLoading(true);

      // Upload gambar ke server eksternal
      const response = await axios.post(
        "https://aduan-be.bandjak.com/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        const imageUrl = response.data.url;
        Swal.fire("Success", "Gambar berhasil diunggah!", "success");

        const backendResponse = await axios.post(
          `${API}/upload_menu_url/${selectedMenu}`,
          {
            ImageUrl: imageUrl,
            MenusID: selectedMenu,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (backendResponse.status === 201) {
          Swal.fire(
            "Success",
            "URL gambar berhasil disimpan di backend!",
            "success"
          );

          // Reset form setelah upload berhasil
          setSelectedMenu("");
          setPreview(null);
          setImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          Swal.fire("Error", "Gagal menyimpan URL gambar di backend.", "error");
        }
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "Gagal mengunggah gambar atau menyimpan URL. Silakan coba lagi.",
        "error"
      );
      console.error("Upload error:", error);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Upload Menu Image
          </h2>

          {/* Dropdown untuk memilih menu */}
          <select
            value={selectedMenu}
            onChange={(e) => setSelectedMenu(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Menu</option>
            {menusBranch.map((menu) => (
              <option key={menu.MenusID} value={menu.MenusID}>
                {menu.MenuName}
              </option>
            ))}
          </select>

          {/* Pratinjau gambar */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded border border-gray-300 shadow-md mb-4"
            />
          )}

          {/* Input file untuk memilih gambar */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="mb-4"
            onChange={updateImage}
          />

          {/* Tombol unggah */}
          <button
            type="button"
            onClick={handleImageUpload}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all duration-200 w-full"
            disabled={imageLoading}
          >
            {imageLoading ? "Uploading..." : "Upload Photo"}
          </button>
        </div>
      </div>
    </>
  );
}

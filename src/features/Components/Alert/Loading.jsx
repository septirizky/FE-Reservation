import Swal from "sweetalert2";
import { useEffect } from "react";

export const Loading = ({ status }) => {
  useEffect(() => {
    if (status === "loading") {
      Swal.fire({
        title: "Loading...",
        text: "Mohon Tunggu",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    }

    if (status === "succeeded") {
      Swal.close();
    }
  }, [status]);

  return null;
};

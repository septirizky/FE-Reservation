import Swal from "sweetalert2";
import { useEffect } from "react";

export const Error = ({ status, error }) => {
  useEffect(() => {
    if (status === "failed") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Error: ${error}`,
      });
    }
  }, [status, error]);

  return null;
};

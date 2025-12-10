// @ts-expect-error - SweetAlert2 types are not available for the dist version
import Swal from "sweetalert2/dist/sweetalert2.js";
// Importar estilos de SweetAlert2
import "sweetalert2/dist/sweetalert2.css";

export const useSweetAlert2 = () => {
  return {
    Swal,
  };
};

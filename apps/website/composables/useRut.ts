import { ref } from "vue";

export function useRut() {
  // Formatea el RUT
  const formatRut = (rut: string): string => {
    // Elimina todos los caracteres que no sean números o K
    rut = rut.replace(/[^\dKk]/g, "");

    // Añade puntos y guión
    if (rut.length > 1) {
      rut =
        rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
        "-" +
        rut.slice(-1);
    }

    return rut.toUpperCase();
  };

  // Valida el RUT chileno
  const validateRut = (rut: string): boolean => {
    // Elimina todos los caracteres que no sean números o K
    rut = rut.replace(/[^\dKk]/g, "");

    if (rut.length < 8 || rut.length > 9) {
      return false;
    }

    const body = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number.parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const calculatedDv = 11 - (sum % 11);
    const validDv =
      calculatedDv === 11
        ? "0"
        : calculatedDv === 10
          ? "K"
          : calculatedDv.toString();

    return dv === validDv;
  };

  return {
    formatRut,
    validateRut,
  };
}

export function useFormatDate() {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-CL', { month: 'short' });
    const year = date.getFullYear();
    let time = date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Reemplazar " p. m." por " pm." y " a. m." por " am."
    // Maneja espacios normales y espacios no separadores (char 160)
    time = time
      .replace(/\s+p\.\s+m\./g, ' pm.')
      .replace(/p\.\s+m\./g, 'pm.')
      .replace(/\s+a\.\s+m\./g, ' am.')
      .replace(/a\.\s+m\./g, 'am.');

    return `${day} ${month} ${year}, ${time}`;
  };

  return { formatDate };
}

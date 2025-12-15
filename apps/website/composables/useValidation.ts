import { Filter } from "bad-words";

export const useValidation = () => {
  const filter = new Filter();
  filter.addWords(
    "imbecil",
    "idiota",
    "estupido",
    "tonto",
    "pendejo",
    "gilipollas",
    "tarado",
    "baboso",
    "bobo",
    "capullo",
    "cabron",
    "mierda",
    "puta",
    "puto",
    "zorra",
    "malparido",
    "huevon",
    "cono",
    "joder"
  );

  const loremWords = [
    "accumsan",
    "adipiscing",
    "aenean",
    "aliquam",
    "aliquet",
    "amet",
    "ante",
    "arcu",
    "auctor",
    "augue",
    "bibendum",
    "blandit",
    "commodo",
    "congue",
    "consectetur",
    "consequat",
    "cursus",
    "curae",
    "curabitur",
    "diam",
    "dictum",
    "dignissim",
    "dolor",
    "donec",
    "dui",
    "duis",
    "efficitur",
    "egestas",
    "eget",
    "eleifend",
    "elementum",
    "elit",
    "enim",
    "erat",
    "eros",
    "euismod",
    "facilisi",
    "faucibus",
    "felis",
    "fermentum",
    "feugiat",
    "finibus",
    "fringilla",
    "gravida",
    "hendrerit",
    "iaculis",
    "imperdiet",
    "interdum",
    "integer",
    "ipsum",
    "justo",
    "lacus",
    "laoreet",
    "libero",
    "ligula",
    "lorem",
    "luctus",
    "lacinia",
    "leo",
    "massa",
    "mauris",
    "maecenas",
    "malesuada",
    "maximus",
    "metus",
    "mi",
    "molestie",
    "mollis",
    "nec",
    "neque",
    "nisi",
    "non",
    "nulla",
    "nullam",
    "nunc",
    "odio",
    "orci",
    "ornare",
    "pede",
    "pellentesque",
    "pharetra",
    "phasellus",
    "porta",
    "porttitor",
    "posuere",
    "praesent",
    "primis",
    "proin",
    "purus",
    "quam",
    "quis",
    "quique",
    "rhoncus",
    "risus",
    "rutrum",
    "sapien",
    "scelerisque",
    "sed",
    "sem",
    "sit",
    "sodales",
    "sollicitudin",
    "suscipit",
    "tellus",
    "tempor",
    "tempus",
    "tincidunt",
    "tortor",
    "tristique",
    "turpis",
    "ultricies",
    "ullamcorper",
    "urna",
    "ut",
    "vel",
    "venenatis",
    "vehicula",
    "veneris",
    "vestibulum",
    "vitae",
    "vivamus",
    "viverra",
    "volutpat",
    "vulputate",
  ];

  // Devuelve true si el texto contiene alguna palabra de lorem ipsum
  const containsLoremWords = (text: string): boolean => {
    return loremWords.some((word) =>
      new RegExp(`\\b${word}\\b`, "i").test(text)
    );
  };

  // Detecta si una palabra tiene más de 3 letras iguales seguidas o patrones repetidos
  const hasRepeatedLetters = (word: string): boolean => {
    // Si la palabra tiene 2 o más letras y todas son iguales, es inválida
    if (/^(\w)\1+$/.test(word)) return true;
    // Más de 3 letras iguales seguidas
    if (/(-\w)\1{2,}/i.test(word)) return true;
    // Patrones de 2 o más caracteres repetidos consecutivamente (ej: asdasdasd, asdfasdf)
    if (/(-\w{2,})\1+/i.test(word)) return true;
    return false;
  };

  const removeDiacritics = (str: string): string => {
    return str.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
  };

  const isValidWord = (word: string): boolean => {
    const sanitizedWord = removeDiacritics(word);

    const profane = filter.isProfane(sanitizedWord);
    const lengthWord = sanitizedWord.length > 20 ? true : false;
    const repeatedLetters = hasRepeatedLetters(sanitizedWord);
    const loremWords = containsLoremWords(sanitizedWord);

    return !profane && !lengthWord && !repeatedLetters && !loremWords;
  };

  const isValidName = (text: string): boolean => {
    return text.split(/\s+/).every((word) => isValidWord(word));
  };

  const isValidAddress = (text: string): boolean => {
    return text.split(/\s+/).every((word) => isValidWord(word));
  };

  const isValidText = (text: string): boolean => {
    return text.split(/\s+/).every((word) => isValidWord(word));
  };

  return { isValidName, isValidAddress, isValidText };
};

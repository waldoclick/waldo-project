export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-4 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-gray-500 text-center">
          © {currentYear} Waldo.click. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

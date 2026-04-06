// ========================================
// FUNCIONES PARA PROBAR CSP EN CONSOLA
// ========================================

// Función principal de prueba
function testCSP() {
  console.log("=== PROBANDO CSP ===");
  console.log("Probando unsafe-eval e unsafe-inline...\n");

  // Test 1: unsafe-eval
  console.log("1. Probando unsafe-eval...");
  try {
    eval('console.log("✅ unsafe-eval: FUNCIONA")');
  } catch (e) {
    console.log("❌ unsafe-eval: BLOQUEADO -", e.message);
  }

  // Test 2: unsafe-inline (crear script)
  console.log("\n2. Probando unsafe-inline (crear script)...");
  try {
    const script = document.createElement("script");
    script.textContent = 'console.log("✅ unsafe-inline: FUNCIONA")';
    document.head.appendChild(script);
  } catch (e) {
    console.log("❌ unsafe-inline: BLOQUEADO -", e.message);
  }

  // Test 3: unsafe-inline (innerHTML)
  console.log("\n3. Probando unsafe-inline (innerHTML)...");
  try {
    const div = document.createElement("div");
    div.innerHTML =
      '<script>console.log("✅ innerHTML script: FUNCIONA")</script>';
    document.body.appendChild(div);
  } catch (e) {
    console.log("❌ innerHTML script: BLOQUEADO -", e.message);
  }

  // Test 4: unsafe-inline (onclick)
  console.log("\n4. Probando unsafe-inline (onclick)...");
  try {
    const button = document.createElement("button");
    button.innerHTML =
      "<button onclick=\"console.log('✅ onclick inline: FUNCIONA')\">Click me</button>";
    document.body.appendChild(button);
  } catch (e) {
    console.log("❌ onclick inline: BLOQUEADO -", e.message);
  }

  // Test 5: Function constructor
  console.log("\n5. Probando Function constructor...");
  try {
    new Function('console.log("✅ Function constructor: FUNCIONA")')();
  } catch (e) {
    console.log("❌ Function constructor: BLOQUEADO -", e.message);
  }

  // Test 6: setTimeout con string
  console.log("\n6. Probando setTimeout con string...");
  try {
    setTimeout('console.log("✅ setTimeout string: FUNCIONA")', 100);
  } catch (e) {
    console.log("❌ setTimeout string: BLOQUEADO -", e.message);
  }

  console.log("\n=== FIN DE PRUEBAS ===");
}

// ========================================
// INSTRUCCIONES DE USO
// ========================================
console.log(`
=== INSTRUCCIONES DE USO ===

1. testCSP()           - Ejecuta todas las pruebas

Ejemplo:
testCSP()
`);

// Auto-ejecutar la función principal
testCSP();

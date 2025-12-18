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

// Función para probar solo unsafe-eval
// eslint-disable-next-line no-unused-vars
function testUnsafeEval() {
  console.log("=== PROBANDO UNSAFE-EVAL ===");

  const tests = [
    {
      name: "eval() básico",
      test: () => eval('console.log("eval funciona!")'),
    },
    {
      name: "Function constructor",
      test: () =>
        new Function('console.log("Function constructor funciona!")')(),
    },
    {
      name: "setTimeout con string",
      test: () => setTimeout('console.log("setTimeout funciona!")', 100),
    },
    {
      name: "setInterval con string",
      test: () => setInterval('console.log("setInterval funciona!")', 2000),
    },
  ];

  for (const { name, test } of tests) {
    try {
      test();
      console.log(`✅ ${name}: FUNCIONA`);
    } catch (e) {
      console.log(`❌ ${name}: BLOQUEADO -`, e.message);
    }
  }
}

// Función para probar solo unsafe-inline
// eslint-disable-next-line no-unused-vars
function testUnsafeInline() {
  console.log("=== PROBANDO UNSAFE-INLINE ===");

  const tests = [
    {
      name: "Crear script inline",
      test: () => {
        const script = document.createElement("script");
        script.textContent = 'console.log("script inline funciona!")';
        document.head.appendChild(script);
      },
    },
    {
      name: "innerHTML con script",
      test: () => {
        const div = document.createElement("div");
        div.innerHTML =
          '<script>console.log("innerHTML script funciona!")</script>';
        document.body.appendChild(div);
      },
    },
    {
      name: "onclick inline",
      test: () => {
        const button = document.createElement("button");
        button.innerHTML =
          "<button onclick=\"console.log('onclick funciona!')\">Click me</button>";
        document.body.appendChild(button);
      },
    },
    {
      name: "onload inline",
      test: () => {
        const img = document.createElement("img");
        img.innerHTML =
          '<img onload="console.log(\'onload funciona!\')" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">';
        document.body.appendChild(img);
      },
    },
  ];

  for (const { name, test } of tests) {
    try {
      test();
      console.log(`✅ ${name}: FUNCIONA`);
    } catch (e) {
      console.log(`❌ ${name}: BLOQUEADO -`, e.message);
    }
  }
}

// Función para limpiar elementos de prueba
// eslint-disable-next-line no-unused-vars
function cleanup() {
  console.log("Limpiando elementos de prueba...");

  // Remover scripts de prueba
  const scripts = document.querySelectorAll("script[data-test]");
  for (const script of scripts) script.remove();

  // Remover botones de prueba
  const testButtons = document.querySelectorAll('button[onclick*="funciona"]');
  for (const button of testButtons) button.remove();

  // Remover divs de prueba
  const testDivs = document.querySelectorAll("div[data-test]");
  for (const div of testDivs) div.remove();

  console.log("Limpieza completada");
}

// Función para verificar CSP actual
// eslint-disable-next-line no-unused-vars
function checkCSP() {
  console.log("=== INFORMACIÓN CSP ACTUAL ===");

  // Obtener CSP del meta tag
  const metaCSP = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]',
  );
  if (metaCSP) {
    console.log("CSP Meta Tag:", metaCSP.content);
  }

  // Obtener CSP de headers (si está disponible)
  const cspHeader = document.querySelector('meta[name="csp-header"]');
  if (cspHeader) {
    console.log("CSP Header:", cspHeader.content);
  }

  // Verificar si hay errores de CSP en la consola
  console.log("Revisa la consola para errores de CSP (rojos)");
}

// ========================================
// INSTRUCCIONES DE USO
// ========================================
console.log(`
=== INSTRUCCIONES DE USO ===

1. testCSP()           - Ejecuta todas las pruebas
2. testUnsafeEval()    - Prueba solo unsafe-eval
3. testUnsafeInline()  - Prueba solo unsafe-inline
4. cleanup()           - Limpia elementos de prueba
5. checkCSP()          - Muestra información CSP

Ejemplo:
testCSP()
`);

// Auto-ejecutar la función principal
testCSP();

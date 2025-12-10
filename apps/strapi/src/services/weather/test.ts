import weatherService from "./index";

async function testWeather() {
  try {
    const data = await weatherService.find("Santiago");
    console.log("Clima en Santiago:", data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testWeather();

// Test script to verify ad store persistence
// Run this in the browser console on /anunciar/resumen page

// Step 1: Check current state
console.log('=== Current Ad Store State ===');
const adStore = useNuxtApp().$pinia._s.get('ad');
console.log('Step:', adStore.step);
console.log('Pack:', adStore.pack);
console.log('Featured:', adStore.featured);
console.log('Ad name:', adStore.ad?.name);
console.log('Ad price:', adStore.ad?.price);

// Step 2: Check localStorage
console.log('\n=== LocalStorage Content ===');
const storedData = localStorage.getItem('ad');
if (storedData) {
  const parsed = JSON.parse(storedData);
  console.log('Stored data:', parsed);
} else {
  console.log('No data in localStorage!');
}

// Step 3: Simulate page reload test
console.log('\n=== To test persistence ===');
console.log('1. Fill the ad creation form with test data');
console.log('2. Navigate to /anunciar/resumen');
console.log('3. Reload the page (F5)');
console.log('4. Run this script again to check if data persists');

// Step 4: Test validateState method
console.log('\n=== Testing validateState ===');
adStore.validateState();
console.log('After validation - Pack:', adStore.pack);
console.log('After validation - Featured:', adStore.featured);
console.log('After validation - Price:', adStore.ad?.price);
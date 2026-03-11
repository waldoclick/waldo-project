// Test script to verify payment totals calculation
// Run this in the browser console on /anunciar/resumen page

console.log('=== Testing Payment Summary Calculation ===');

// Get the store and composables
const { $pinia } = useNuxtApp();
const adStore = $pinia._s.get('ad');

// Check current state
console.log('\n1. Current Store State:');
console.log('   Pack:', adStore.pack, typeof adStore.pack);
console.log('   Featured:', adStore.featured, typeof adStore.featured);
console.log('   Is Invoice:', adStore.is_invoice);

// Check localStorage
console.log('\n2. LocalStorage Content:');
const storedData = localStorage.getItem('ad');
if (storedData) {
  const parsed = JSON.parse(storedData);
  console.log('   Pack from storage:', parsed.pack);
  console.log('   Featured from storage:', parsed.featured);
}

// Check if packs are loaded
console.log('\n3. Packs List Status:');
const { packs, loadPacks } = usePacksList();
console.log('   Packs loaded:', packs.value.length > 0);
console.log('   Packs count:', packs.value.length);
if (packs.value.length > 0 && typeof adStore.pack === 'number') {
  const selectedPack = packs.value.find(p => p.id === adStore.pack);
  console.log('   Selected pack:', selectedPack ? selectedPack.name : 'NOT FOUND');
}

// Calculate totals
console.log('\n4. Payment Summary Calculation:');
const { packPart, featuredPart, totalAmount, hasToPay } = useAdPaymentSummary();
console.log('   Pack part:', packPart.value);
console.log('   Featured part:', featuredPart.value);
console.log('   Total amount:', totalAmount.value);
console.log('   Has to pay:', hasToPay.value);

// Test after loading packs
console.log('\n5. Testing after loading packs...');
await loadPacks();
console.log('   Packs now loaded:', packs.value.length);
console.log('   Recalculating totals...');
console.log('   Total amount after loading:', totalAmount.value);
console.log('   Has to pay after loading:', hasToPay.value);
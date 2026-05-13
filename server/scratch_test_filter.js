const orders = [
  {
    _id: "lnqefgbqKA64IDZOWpVC",
    id: "lnqefgbqKA64IDZOWpVC",
    status: "Cancelled (Suspicious)",
    isDeletedByAdmin: true,
    email: "himanshu0481@gmail.com"
  }
];

const orderSearch = "";
const orderFilter = "Suspicious";

const searchLower = orderSearch.toLowerCase();
const filtered = orders.filter(o => {
  const idMatch = String(o?._id || o?.id || '').toLowerCase().includes(searchLower);
  const phoneMatch = String(o?.shippingAddress?.phone || '').includes(orderSearch);
  const emailMatch = String(o?.email || '').toLowerCase().includes(searchLower);
  
  const isSuspicious = o.isDeletedByAdmin === true || o.status?.includes('Suspicious');
  let statusMatch = false;

  if (orderFilter === 'Suspicious') {
    statusMatch = isSuspicious;
  } else {
    if (isSuspicious) return false;
    statusMatch = orderFilter === 'All' || o?.status === orderFilter;
  }

  return statusMatch && (idMatch || phoneMatch || emailMatch);
});

console.log("FILTER TEST RESULTS:");
console.log("Input Order:", orders[0]);
console.log("Filtered Output Length:", filtered.length);
console.log("Matches Found:", filtered[0] ? "YES" : "NO");
process.exit(0);

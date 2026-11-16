import { redirect } from "next/navigation";

// Retailers now use the same account page as customers (bookings, enquiries, sign-ins).
// This route stays so old links and the footer keep working.
export default function Page() {
  redirect("/account");
}

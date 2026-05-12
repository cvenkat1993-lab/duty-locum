import { redirect } from "next/navigation";

// This page has been superseded by /browse-jobs
export default function SearchPage() {
  redirect("/browse-jobs");
}

import { redirect } from "next/navigation";

export default function BugFinderRedirect() {
  redirect("/dashboard/bugs");
}

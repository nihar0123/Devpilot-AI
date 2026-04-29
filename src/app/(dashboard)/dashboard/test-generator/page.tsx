import { redirect } from "next/navigation";

export default function TestGeneratorRedirect() {
  redirect("/dashboard/tests");
}

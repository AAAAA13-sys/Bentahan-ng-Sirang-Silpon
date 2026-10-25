import os

page_content = """import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authConfigured, getSession } from "@/lib/auth";
import GoogleLogin from "@/components/GoogleLogin";
import ScrumWorkspace from "@/components/ScrumWorkspace";

export const dynamic = "force-dynamic";

export default async function Home(props: { searchParams?: Promise<{ demo?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const requestHeaders = await headers();
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3002";
  if (requestHeaders.get("host") !== new URL(baseURL).host) redirect(baseURL);
  
  const session = await getSession(requestHeaders);
  const isDemo = searchParams.demo === "true";
  
  if (!session && !isDemo) {
    return <GoogleLogin configured={authConfigured()} />;
  }
  
  const account = session 
    ? { name: session.user.name, email: session.user.email } 
    : { name: "Guest Engineer (Demo)", email: "guest@scrumroom.local" };

  return <ScrumWorkspace key={account.email} account={account} isGuest={!session} />;
}
"""

with open(r"c:\Users\PLP\Music\Scrum stuff mine\app\page.tsx", "w", encoding="utf-8") as f:
    f.write(page_content)
print("Updated app/page.tsx")

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Web Share Target handler.
 *
 * Manifest declares this route as the share endpoint (POST multipart/form-data).
 * We don't process the upload here — the Documents page picks up the
 * `?shared=1` flag and prompts the user to attach the freshly received file.
 * Storing files server-side without explicit confirmation would surprise users.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent("/documents?shared=1");
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url), { status: 303 });
  }

  // Drain the multipart body so the browser doesn't dangle the request;
  // we intentionally drop the content — the client will re-pick the file.
  try {
    await request.formData();
  } catch {
    // ignore — empty share is fine
  }

  return NextResponse.redirect(new URL("/documents?shared=1", request.url), { status: 303 });
}

// Some Android share intents reuse GET — handle gracefully
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/documents?shared=1", request.url), { status: 303 });
}

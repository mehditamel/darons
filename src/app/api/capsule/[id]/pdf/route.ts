import { NextResponse } from "next/server";
import { getRecapById } from "@/lib/actions/capsule";
import { renderRecapPdf } from "@/lib/capsule/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const result = await getRecapById(params.id);
  if (!result.success || !result.data) {
    return NextResponse.json({ error: "Récap introuvable" }, { status: 404 });
  }

  const recap = result.data;
  const pdf = await renderRecapPdf(recap.content);
  const safeTitle =
    (recap.title ?? recap.content?.title ?? "capsule")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60);

  const body = new Uint8Array(pdf);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeTitle}.pdf"`,
      "Cache-Control": "private, no-cache",
    },
  });
}

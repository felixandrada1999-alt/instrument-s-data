import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureInstrumentTable } from "@/lib/database";

const maxPhotoSize = 4 * 1024 * 1024;
const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET() {
  try {
    const sql = await ensureInstrumentTable();
    const instruments = await sql`
      SELECT id, uploader_name, instrument_name, part_number, serial_number, photo_url, created_at
      FROM instruments
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ instruments });
  } catch (error) {
    console.error("Error consultando el inventario:", error);
    return NextResponse.json(
      { error: "No se pudo conectar con la base de datos. Revisá DATABASE_URL en la configuración." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  let photoUrl: string | undefined;

  try {
    const form = await request.formData();
    const uploaderName = String(form.get("uploaderName") ?? "").trim();
    const instrumentName = String(form.get("instrumentName") ?? "").trim();
    const partNumber = String(form.get("partNumber") ?? "").trim();
    const serialNumber = String(form.get("serialNumber") ?? "").trim();
    const photo = form.get("photo");

    if (!uploaderName || !instrumentName || !partNumber || !serialNumber) {
      return NextResponse.json({ error: "Completá todos los campos obligatorios." }, { status: 400 });
    }
    if (uploaderName.length > 120 || instrumentName.length > 160 || partNumber.length > 120 || serialNumber.length > 120) {
      return NextResponse.json({ error: "Uno o más campos superan el largo permitido." }, { status: 400 });
    }
    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json({ error: "Seleccioná una fotografía del instrumento." }, { status: 400 });
    }
    if (!allowedPhotoTypes.has(photo.type)) {
      return NextResponse.json({ error: "La foto debe estar en formato JPG, PNG o WEBP." }, { status: 400 });
    }
    if (photo.size > maxPhotoSize) {
      return NextResponse.json({ error: "La fotografía no puede superar los 4 MB." }, { status: 413 });
    }

    const sql = await ensureInstrumentTable();
    const uploaded = await put(photo.name, photo, {
      access: "public",
      addRandomSuffix: true,
      contentType: photo.type,
    });
    photoUrl = uploaded.url;

    const [instrument] = await sql`
      INSERT INTO instruments (uploader_name, instrument_name, part_number, serial_number, photo_url)
      VALUES (${uploaderName}, ${instrumentName}, ${partNumber}, ${serialNumber}, ${photoUrl})
      RETURNING id, uploader_name, instrument_name, part_number, serial_number, photo_url, created_at
    `;

    return NextResponse.json({ instrument }, { status: 201 });
  } catch (error) {
    if (photoUrl) {
      try {
        await del(photoUrl);
      } catch (cleanupError) {
        console.error("No se pudo eliminar la foto luego de un error:", cleanupError);
      }
    }
    console.error("Error guardando el instrumento:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el registro. Verificá la conexión de la base de datos y Vercel Blob." },
      { status: 503 },
    );
  }
}
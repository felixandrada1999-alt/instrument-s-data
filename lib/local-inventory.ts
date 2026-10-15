import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

type Instrument = {
  id: string;
  uploader_name: string;
  instrument_name: string;
  part_number: string;
  serial_number: string;
  photo_url: string;
  created_at: string;
};

const projectRoot = process.cwd();
const recordsDirectory = path.join(projectRoot, ".local-data", "instruments");
const uploadsDirectory = path.join(projectRoot, "public", "uploads");
const photoExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function isLocalStorageEnabled() {
  const hasDatabase = Boolean((process.env.DATABASE_URL ?? process.env.POSTGRES_URL)?.trim());
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  return process.env.NODE_ENV === "development" && !(hasDatabase && hasBlobToken);
}

export async function getLocalInstruments(): Promise<Instrument[]> {
  let fileNames: string[];
  try {
    fileNames = await readdir(recordsDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const records = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".json"))
      .map(async (fileName) => {
        const content = await readFile(path.join(recordsDirectory, fileName), "utf8");
        return JSON.parse(content) as Instrument;
      }),
  );

  return records.sort((first, second) => Date.parse(second.created_at) - Date.parse(first.created_at));
}

export async function createLocalInstrument(input: {
  uploaderName: string;
  instrumentName: string;
  partNumber: string;
  serialNumber: string;
  photo: File;
}): Promise<Instrument> {
  const id = randomUUID();
  const extension = photoExtensions[input.photo.type];
  const fileName = `${id}${extension}`;
  const photoPath = path.join(uploadsDirectory, fileName);
  const recordPath = path.join(recordsDirectory, `${id}.json`);
  const instrument: Instrument = {
    id,
    uploader_name: input.uploaderName,
    instrument_name: input.instrumentName,
    part_number: input.partNumber,
    serial_number: input.serialNumber,
    photo_url: `/uploads/${fileName}`,
    created_at: new Date().toISOString(),
  };

  await mkdir(uploadsDirectory, { recursive: true });
  await mkdir(recordsDirectory, { recursive: true });
  await writeFile(photoPath, Buffer.from(await input.photo.arrayBuffer()), { flag: "wx" });
  try {
    await writeFile(recordPath, JSON.stringify(instrument), { flag: "wx" });
  } catch (error) {
    await unlink(photoPath).catch(() => undefined);
    throw error;
  }

  return instrument;
}

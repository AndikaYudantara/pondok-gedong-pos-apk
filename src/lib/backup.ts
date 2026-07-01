import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export async function exportBackup(data: unknown) {
  const stamp = new Date().toISOString().slice(0, 10);

  const fileName = `pondok-gedong-menu-${stamp}.json`;

  await Filesystem.writeFile({
    path: fileName,
    data: JSON.stringify(data, null, 2),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  });

  return fileName;
}

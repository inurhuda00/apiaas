import { eq, type Database } from "@apiaas/db";
import { files } from "@apiaas/db/schema";
import type { NewFile } from "@apiaas/db/schema";

/**
 * Create a new file record in the database
 * 
 * @param db Database instance
 * @param file File data to insert
 * @returns The newly created file
 */
export async function createFile(db: Database, file: NewFile) {
  const [newFile] = await db
    .insert(files)
    .values({
      productId: file.productId,
      name: file.name,
      extension: file.extension,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      url: file.url,
      fileType: file.fileType,
      width: file.width,
      height: file.height,
    })
    .returning({
      id: files.id,
      productId: files.productId,
      name: files.name,
      extension: files.extension,
      fileName: files.fileName,
      fileSize: files.fileSize,
      mimeType: files.mimeType,
      url: files.url,
      fileType: files.fileType,
      createdAt: files.createdAt,
    });

  return newFile;
}

/**
 * Get all files for a product
 * 
 * @param db Database instance
 * @param productId Product ID
 * @returns Array of files
 */
export async function getProductFiles(db: Database, productId: number) {
  const productFiles = await db.query.files.findMany({
    where: eq(files.productId, productId),
    orderBy: (files, { asc }) => [asc(files.createdAt)],
  });

  return productFiles;
}

/**
 * Delete a file by fileName
 * 
 * @param db Database instance
 * @param fileName File name to delete
 * @returns Boolean indicating if the deletion was successful
 */
export async function deleteFileByFileName(db: Database, fileName: string) {
  try {
    const [deletedFile] = await db
      .delete(files)
      .where(eq(files.fileName, fileName))
      .returning({ id: files.id });

    return !!deletedFile;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
} 
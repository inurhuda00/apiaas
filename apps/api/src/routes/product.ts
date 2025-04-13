import { Hono } from "hono";
import { AuthRoleMiddleware } from "../middleware/auth";
import type { Env, Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const productRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Apply authentication middleware
productRoute.use("/*", AuthRoleMiddleware(["admin", "free"]));

// Schema for product creation
const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  description: z.string().optional(),
  price: z.string().min(1, { message: "Price is required" }),
  category: z.string().min(1, { message: "Category is required" }),
});
// Schema for product media upload
const mediaUploadSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  file: z.instanceof(File, { message: "File is required" }),
  isPrimary: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().optional().default(false)
  ),
});

// Schema for product file upload
const fileUploadSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  file: z.instanceof(File, { message: "File is required" }),
});

// Helper functions
const generateUniqueFilename = (originalName: string) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const ext = originalName.split(".").pop();
  return `${timestamp}-${randomString}.${ext}`;
};

const validateImageMimeType = (file: File) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`
    );
  }
};

// Create a new product
productRoute.post(
  "/create",
  zValidator("json", productSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error.format(),
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const data = await c.req.valid("json");
      const user = c.get("user");

      // In a real implementation, you would save the product to your database here
      // For the demo, we'll just return the product data with a mock ID
      const productId = `prod_${Date.now()}`;

      return c.json({
        success: true,
        data: {
          id: productId,
          ...data,
          userId: user.id,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Product creation error:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create product",
        },
        500
      );
    }
  }
);

// Upload product media (images)
productRoute.post(
  "/media",
  zValidator("form", mediaUploadSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error.format(),
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const data = await c.req.valid("form");
      const file = data.file;
      const productId = data.productId;
      const isPrimary = data.isPrimary;

      try {
        validateImageMimeType(file);
      } catch (err) {
        return c.json(
          {
            success: false,
            error: err instanceof Error ? err.message : "Invalid file type",
          },
          400
        );
      }

      const uniqueFilename = generateUniqueFilename(file.name);
      const user = c.get("user");

      await c.env.BUCKET.put(`products/${productId}/media/${uniqueFilename}`, file, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          userId: user.id.toString(),
          productId,
          originalName: file.name,
          isPrimary: isPrimary.toString(),
          uploadedAt: new Date().toISOString(),
        },
      });

      const publicUrl = `https://assets.mondive.xyz/products/${productId}/media/${uniqueFilename}`;

      return c.json({
        success: true,
        data: {
          url: publicUrl,
          filename: uniqueFilename,
          size: file.size,
          type: file.type,
          isPrimary,
        },
      });
    } catch (error) {
      console.error("Media upload error:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to upload media",
        },
        500
      );
    }
  }
);

// Upload product files (downloadable files)
productRoute.post(
  "/files",
  zValidator("form", fileUploadSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error.format(),
        },
        400
      );
    }
  }),
  async (c) => {
    try {
      const data = await c.req.valid("form");
      const file = data.file;
      const productId = data.productId;

      const uniqueFilename = generateUniqueFilename(file.name);
      const user = c.get("user");

      await c.env.BUCKET.put(`products/${productId}/files/${uniqueFilename}`, file, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          userId: user.id.toString(),
          productId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      // For downloadable files, we won't expose the direct URL
      return c.json({
        success: true,
        data: {
          filename: uniqueFilename,
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to upload file",
        },
        500
      );
    }
  }
);

// Get all media for a product
productRoute.get("/media/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");

    if (!productId) {
      return c.json(
        {
          success: false,
          error: "Product ID is required",
        },
        400
      );
    }

    const prefix = `products/${productId}/media/`;
    const objects = await c.env.BUCKET.list({ prefix });

    const mediaItems = objects.objects.map((obj) => {
      const filename = obj.key.replace(prefix, "");
      return {
        filename,
        url: `https://assets.mondive.xyz/${obj.key}`,
        size: obj.size,
        uploadedAt: obj.uploaded,
        isPrimary: obj.customMetadata?.isPrimary === "true",
        metadata: obj.customMetadata,
      };
    });

    return c.json({
      success: true,
      data: mediaItems,
    });
  } catch (error) {
    console.error("Get media error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get media",
      },
      500
    );
  }
});

// Get all files for a product
productRoute.get("/files/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");

    if (!productId) {
      return c.json(
        {
          success: false,
          error: "Product ID is required",
        },
        400
      );
    }

    const prefix = `products/${productId}/files/`;
    const objects = await c.env.BUCKET.list({ prefix });

    const files = objects.objects.map((obj) => {
      const filename = obj.key.replace(prefix, "");
      return {
        filename,
        originalName: obj.customMetadata?.originalName,
        size: obj.size,
        uploadedAt: obj.uploaded,
        metadata: obj.customMetadata,
      };
    });

    return c.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Get files error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get files",
      },
      500
    );
  }
});

// Delete a media item
productRoute.delete("/media/:productId/:filename", async (c) => {
  try {
    const productId = c.req.param("productId");
    const filename = c.req.param("filename");

    if (!productId || !filename) {
      return c.json(
        {
          success: false,
          error: "Product ID and filename are required",
        },
        400
      );
    }

    const key = `products/${productId}/media/${filename}`;
    await c.env.BUCKET.delete(key);

    return c.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete media",
      },
      500
    );
  }
});

// Delete a file
productRoute.delete("/files/:productId/:filename", async (c) => {
  try {
    const productId = c.req.param("productId");
    const filename = c.req.param("filename");

    if (!productId || !filename) {
      return c.json(
        {
          success: false,
          error: "Product ID and filename are required",
        },
        400
      );
    }

    const key = `products/${productId}/files/${filename}`;
    await c.env.BUCKET.delete(key);

    return c.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      },
      500
    );
  }
});

export default productRoute; 
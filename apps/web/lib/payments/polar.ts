import { z } from "zod";
import { Polar } from "@polar-sh/sdk";
import { env } from "@/env";

export const polar = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN,
	server: "sandbox",
});

export const WORKSPACE_ID = env.POLAR_WORKSPACE_ID;

export async function validateLicenseKey(key: string) {}

export const licenseStatusSchema = z.enum([
	"active",
	"expired",
	"invalid",
	"revoked",
	"inactive",
]);

export type LicenseStatus = z.infer<typeof licenseStatusSchema>;

export const tierSchema = z.enum(["free", "premium"]);
export type Tier = z.infer<typeof tierSchema>;

export const licenseValidationResponseSchema = z.object({
	valid: z.boolean(),
	tier: tierSchema.optional(),
	expiresAt: z.date().optional(),
	error: z.string().optional(),
});

export type LicenseValidationResponse = z.infer<
	typeof licenseValidationResponseSchema
>;

export function getCustomerPortalUrl() {}

export async function verifyLicenseKey() {}

export async function activateLicenseKey() {
	return false;
}

export async function deactivateLicenseKey() {}

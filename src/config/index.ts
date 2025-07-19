import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const numericEnvVar = (fieldName: string, defaultValue?: number) => {
    const baseSchema = z
        .string()
        .nonempty(`${fieldName} is required`)
        .refine((val) => !isNaN(Number(val)), `${fieldName} must be a valid number`)
        .transform(Number);

    return defaultValue !== undefined
        ? baseSchema.default(defaultValue) // ✅ Pass the number directly
        : baseSchema;
};  

export const configSchema = z.object({
    PROJECT_ID: z.string().nonempty("PROJECT_ID is required"),
    LOCATION: z.string().nonempty("LOCATION is required"),
    PORT: numericEnvVar("PORT", 5001), // Default value of 5001
    MODEL: z.string().nonempty("MODEL is required"),

    // Optional: Add Google Service Key if using environment variable approach
    GOOGLE_SERVICE_KEY: z.string().optional(),
    GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ ENVIRONMENT VARIABLES VALIDATION FAILED:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}

console.log("✅ Environment validation passed");

const config = parsed.data;
export default config;
export type Config = typeof config;

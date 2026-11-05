import { z } from "zod";
import { FONT_IDS } from "./options";
import { DECORATION_TYPES } from "../decorations/catalog";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a #RRGGBB colour");
const shortText = (max: number) => z.string().max(max).optional();

export const decorationSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(DECORATION_TYPES),
  x: z.number().min(-0.2).max(1.2),
  y: z.number().min(-0.2).max(1.2),
  width: z.number().min(0.02).max(1),
  height: z.number().min(0.01).max(1.5),
  rotation: z.number().min(-360).max(360),
});

export const letterDocumentSchema = z.object({
  id: z.string().min(1).max(64),
  version: z.literal(1),
  title: shortText(120),
  recipient: shortText(80),
  date: shortText(60),
  greeting: shortText(80),
  message: z.string().max(12000),
  closing: shortText(80),
  signature: shortText(80),
  templateId: shortText(64),
  paper: z.object({
    color: hex,
    style: z.enum(["blank", "lined", "dotted", "grid", "halftone", "sunburst"]),
    texture: z.enum(["smooth", "grainy", "vintage", "recycled", "linen"]),
    size: z.enum(["A4", "A5"]),
    edgeStyle: z.enum(["straight", "rounded", "torn"]),
  }),
  typography: z.object({
    fontFamily: z.enum(FONT_IDS),
    fontSize: z.number().min(10).max(60),
    inkColor: hex,
    lineHeight: z.number().min(1).max(3),
    letterSpacing: z.number().min(-2).max(8),
    alignment: z.enum(["left", "center", "right", "justify"]),
  }),
  decorations: z.array(decorationSchema).max(40),
  createdAt: z.string().max(40),
  updatedAt: z.string().max(40),
});

export const EXPIRY_OPTIONS = ["never", "1d", "7d", "30d", "90d"] as const;
export type ExpiryOption = (typeof EXPIRY_OPTIONS)[number];

export const createShareSchema = z.object({
  letter: letterDocumentSchema,
  expiresIn: z.enum(EXPIRY_OPTIONS).default("never"),
});

/** 24 random bytes, base64url → 32 chars. */
export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);
export const revokeKeySchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export const revokeSchema = z.object({ token: tokenSchema, revokeKey: revokeKeySchema });
export const statusSchema = z.object({
  links: z.array(z.object({ token: tokenSchema, revokeKey: revokeKeySchema })).min(1).max(100),
});

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { HeroService } from "@/lib/services/heroService";
import { requireStaff } from "@/lib/auth/guard";

const reorderSchema = z.object({
  slides: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(
  request: NextRequest
) {
  const auth =
    await requireStaff(request);

  if ("error" in auth) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      {
        status: auth.status,
      }
    );
  }

  try {
    const body =
      await request.json();

    const validated =
      reorderSchema.parse(body);

    const slides =
      await HeroService.reorderSlides(
        validated.slides,
        {
          id: auth.user.id,
          email: auth.user.email,
          role: auth.user.role,
        }
      );

    return NextResponse.json({
      success: true,
      data: slides,
      error: null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Invalid reorder payload",
            details: error.issues,
          },
        },
        {
          status: 400,
        }
      );
    }

    console.error(
      "Hero reorder error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "HERO_REORDER_FAILED",
          message:
            "Failed to reorder hero slides",
        },
      },
      {
        status: 500,
      }
    );
  }
}
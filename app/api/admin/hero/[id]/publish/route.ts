import { NextRequest, NextResponse } from "next/server";

import { HeroService } from "@/lib/services/heroService";
import { requireStaff } from "@/lib/auth/guard";

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
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

  const { id } = await params;

  try {
    const slide =
      await HeroService.publishSlide(
        id,
        {
          id: auth.user.id,
          email: auth.user.email,
          role: auth.user.role,
        }
      );

    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "HERO_SLIDE_NOT_FOUND",
            message:
              "Hero slide not found",
          },
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: slide,
      error: null,
    });
  } catch (error) {
    console.error(
      "Hero publish error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "HERO_PUBLISH_FAILED",
          message:
            "Failed to publish hero slide",
        },
      },
      {
        status: 500,
      }
    );
  }
}
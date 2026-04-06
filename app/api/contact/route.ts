import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactSubmissionSchema } from "@/lib/contact";
import { saveContactLead } from "@/lib/server/noon-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = contactSubmissionSchema.parse(await request.json());
    const lead = saveContactLead(payload);

    return NextResponse.json(
      {
        success: true,
        lead: {
          id: lead.id,
          inquiry: lead.inquiry,
          createdAt: lead.createdAt,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Please review the form fields and try again.",
          fieldErrors: error.flatten().fieldErrors,
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.error("Contact form submission failed.", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Your inquiry could not be sent right now. Please try again in a moment or contact us directly at noon.message@gmail.com.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

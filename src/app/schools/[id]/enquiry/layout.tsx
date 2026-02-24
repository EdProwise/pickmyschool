import { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Types } from "mongoose";
import mongoose from "mongoose";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Database connection not established");

    let school;
    if (Types.ObjectId.isValid(id)) {
      school = await db.collection("schools").findOne({ _id: new Types.ObjectId(id) });
    }
    if (!school) {
      school = await db.collection("schools").findOne({ slug: id });
    }

    const schoolName = school?.name || "School";
    const city = school?.city || "";

    return {
      title: `Enquiry - ${schoolName}${city ? ` | ${city}` : ""}`,
      description: `Submit an admission enquiry for ${schoolName}${city ? ` in ${city}` : ""}. Connect directly with the school to get information on fees, seats, and the admission process.`,
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical: `https://www.pickmyschool.in/schools/${id}/enquiry`,
      },
    };
  } catch {
    return {
      title: "School Enquiry | PickMySchool",
      description: "Submit an admission enquiry and connect directly with the school.",
      robots: { index: false, follow: false },
    };
  }
}

export default function EnquiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

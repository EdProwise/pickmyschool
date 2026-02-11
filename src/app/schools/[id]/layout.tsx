import { Metadata } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const client = await clientPromise;
    const db = client.db();
    
    let school;
    if (ObjectId.isValid(id)) {
      school = await db.collection("schools").findOne({ _id: new ObjectId(id) });
    }
    
    if (!school) {
      school = await db.collection("schools").findOne({ slug: id });
    }

    if (!school) {
      return {
        title: "School Not Found",
        description: "The requested school could not be found.",
      };
    }

    const schoolName = school.name || "School";
    const city = school.city || "";
    const board = school.board || "";
    const description = school.aboutSchool 
      ? school.aboutSchool.substring(0, 155) + "..."
      : `${schoolName} is a ${board} school located in ${city}. View fees, facilities, reviews, and admission details on PickMySchool.`;

    return {
      title: `${schoolName} - Fees, Reviews, Admission ${city ? `| ${city}` : ""}`,
      description,
      keywords: [
        schoolName,
        `${schoolName} fees`,
        `${schoolName} admission`,
        `${schoolName} reviews`,
        `${board} school ${city}`,
        `best schools in ${city}`,
        "school admission India",
      ].filter(Boolean),
      openGraph: {
        title: `${schoolName} - Fees, Reviews & Admission Details`,
        description,
        url: `https://www.pickmyschool.in/schools/${id}`,
        type: "website",
        images: school.bannerImageUrl ? [
          {
            url: school.bannerImageUrl,
            width: 1200,
            height: 630,
            alt: schoolName,
          },
        ] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${schoolName} - Fees, Reviews & Admission`,
        description,
        images: school.bannerImageUrl ? [school.bannerImageUrl] : undefined,
      },
      alternates: {
        canonical: `https://www.pickmyschool.in/schools/${id}`,
      },
    };
  } catch (error) {
    console.error("Error generating school metadata:", error);
    return {
      title: "School Details",
      description: "View school details, fees, reviews, and admission information on PickMySchool.",
    };
  }
}

export default function SchoolDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

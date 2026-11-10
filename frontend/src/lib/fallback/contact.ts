import type { ContactPageData } from "@/types/api";
import { contactContent } from "@/lib/content/velcraft";

export const fallbackContactPage: ContactPageData = {
  brand: {
    name: "Velcraft",
  },
  contact: {
    title: contactContent.info.title,
    description: contactContent.info.description,
    email: contactContent.info.email,
    phone: contactContent.info.phone,
    hours: contactContent.info.hours,
    address: contactContent.info.address,
  },
};

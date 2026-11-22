export type EditablePageKey = "about" | "contact" | "collection" | "customize" | "home";

export const PAGE_META: Record<
  EditablePageKey,
  {
    title: string;
    description: string;
    previewPath: string;
    sections: Record<string, { title: string; hint: string; fields?: string[] }>;
  }
> = {
  home: {
    title: "Homepage",
    description: "Hero, trust strip, products, atelier, FAQ and final CTA copy.",
    previewPath: "/",
    sections: {
      products: {
        title: "Featured products",
        hint: "Heading above the product carousel.",
      },
      trust: {
        title: "Trust strip",
        hint: "Marquee labels under the hero.",
      },
      atelier: {
        title: "Atelier showcase",
        hint: "Crafted style panel with feature list and CTA.",
      },
      testimonials: {
        title: "Testimonials heading",
        hint: "Eyebrow and title above customer reviews.",
      },
      faq: {
        title: "FAQ",
        hint: "FAQ heading. Question list is edited in Homepage → sections body.",
      },
      final_cta: {
        title: "Final CTA",
        hint: "Bottom call-to-action band.",
      },
    },
  },
  about: {
    title: "About",
    description: "Story and hero copy on the About page.",
    previewPath: "/about",
    sections: {
      hero: {
        title: "Hero",
        hint: "Main headline visitors see first.",
      },
      story: {
        title: "Our story",
        hint: "Brand story block.",
      },
      process: {
        title: "Process",
        hint: "How customization works.",
      },
      why: {
        title: "Why Velcraft",
        hint: "Reasons to choose the brand.",
      },
      faq: {
        title: "FAQ",
        hint: "About-page questions.",
      },
      final_cta: {
        title: "Final CTA",
        hint: "Closing call to action.",
      },
    },
  },
  contact: {
    title: "Contact",
    description: "Hero and supporting copy above the contact form.",
    previewPath: "/contact",
    sections: {
      hero: {
        title: "Hero",
        hint: "Title and intro above contact details.",
      },
      form: {
        title: "Form intro",
        hint: "Copy next to the message form.",
      },
    },
  },
  collection: {
    title: "Collection",
    description: "Page heading shoppers see when browsing shoes.",
    previewPath: "/collection",
    sections: {
      hero: {
        title: "Page heading",
        hint: "Eyebrow, title and description at the top of /collection.",
      },
    },
  },
  customize: {
    title: "Customize studio",
    description: "Title and description on the 3D designer page.",
    previewPath: "/customize/studio-loafer",
    sections: {
      hero: {
        title: "Studio heading",
        hint: "Shown above the 3D customizer on desktop.",
      },
    },
  },
};

export function isEditablePageKey(value: string): value is EditablePageKey {
  return value in PAGE_META;
}

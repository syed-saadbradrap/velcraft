import { siteConfig } from "@/config/site";

export const homeContent = {
  hero: {
    eyebrow: "Bespoke Luxury Footwear",
    title: "Your Shoes.",
    titleAccent: "Your Signature.",
    description:
      "Design footwear that's made to match your style—not someone else's. Configure materials, colors, buckles, and soles in real time with our interactive 3D atelier.",
    ctaLabel: "Start Customizing",
    ctaSecondaryLabel: "Browse Collection",
    ctaUrl: "/customize/ivory-gold-bit-mule",
    ctaSecondaryUrl: "/collection",
    image: "/images/hero/grey-loafer-hero.png",
    stats: [
      { value: "20+", label: "Premium colors" },
      { value: "10+", label: "Buckle designs" },
      { value: "7–10 days", label: "Delivery" },
    ],
  },
  whySettle: {
    eyebrow: "Why Settle for Ordinary?",
    title: "Every Detail, Designed by You",
    description:
      "Your footwear should be as unique as you are. With our intuitive 3D customization experience, you're in complete control from the first click to the final design.",
    highlights: [
      {
        title: "Premium Shoe Fabrics",
        description:
          "Crafted with high-quality leather and suede materials for exceptional comfort, durability, and style.",
        icon: "gem",
      },
      {
        title: "More than 20 Colors",
        description: "Choose from an extensive palette to match every outfit and personality.",
        icon: "palette",
      },
      {
        title: "Over 10 Buckle Designs",
        description: "From timeless classics to modern statement pieces.",
        icon: "buckle",
      },
      {
        title: "Every Size Available",
        description:
          "A comfortable fit for everyone-because great style starts with the perfect fit.",
        icon: "size",
      },
      {
        title: "For Men & Women",
        description: "Customized footwear for every style, occasion, and individual.",
        icon: "people",
      },
    ],
  },
  products: {
    eyebrow: "Shop Collection",
    title: "Signature Styles, Ready to Wear",
    description:
      "Explore our curated mule collection with premium fabrics, signature buckles, and sizes for men and women. Add to cart instantly or open customization to personalize your pair.",
    stats: [
      { label: "Premium colors", value: "20+" },
      { label: "Buckle designs", value: "10+" },
      { label: "Unisex sizing", value: "Men & Women" },
    ],
  },
  craftedStyle: {
    eyebrow: "Crafted Around Your Style",
    title: "See It. Customize It. Wear It.",
    description:
      "Experience your design before it reaches your doorstep. Our real-time 3D configurator lets you visualize every change instantly, ensuring every pair feels truly yours.",
    whyCustomersLoveUs: "Why Customers Love Us",
    features: [
      "5+ customizations",
      "Premium craftsmanship",
      "Personalized to your preferences",
      "Stylish, comfortable, and built to last",
      "Secure ordering and reliable delivery",
    ],
    ctaLabel: "Start Designing",
  },
  testimonials: {
    eyebrow: "Customer Reviews",
    title: "Loved by Every Step",
    items: [
      {
        customer_name: "Junaid Zia",
        content:
          '"The customization experience is incredible." Being able to preview every change in 3D made designing my shoes so easy. The final pair looked exactly like I imagined.',
        rating: 5,
      },
      {
        customer_name: "Fizza Shah",
        content:
          '"Premium quality with endless options." The fabric quality exceeded my expectations, and the buckle choices gave my shoes a completely unique look.',
        rating: 5,
      },
      {
        customer_name: "Khurram Khattak",
        content:
          '"Perfect fit and amazing craftsmanship." Finally found shoes that fit perfectly and reflect my personal style. I\'ll definitely be designing another pair.',
        rating: 5,
      },
    ],
  },
  faqs: [
    {
      question: "Can I customize every part of the shoe?",
      answer:
        "Yes. Personalize colors, premium fabrics, buckles, soles, sizes, and shoe styles through our interactive 3D designer.",
    },
    {
      question: "How many colors can I choose from?",
      answer: "We offer 20+ carefully selected colors, with new options added regularly.",
    },
    {
      question: "What buckle options are available?",
      answer:
        "Choose from 10+ buckle designs, ranging from classic finishes to bold contemporary styles.",
    },
    {
      question: "Do you offer sizes for everyone?",
      answer:
        "Absolutely. We provide a complete size range for both men and women to ensure the perfect fit.",
    },
    {
      question: "Can I see my design before ordering?",
      answer:
        "Yes. Our live 3D configurator updates instantly, allowing you to preview every customization before placing your order.",
    },
    {
      question: "Are the materials premium quality?",
      answer:
        "Every pair is crafted using carefully selected premium fabrics and quality components designed for comfort, durability, and lasting style.",
    },
    {
      question: "Are your shoes available for both men and women?",
      answer:
        "Yes. Our customization platform is designed for both men's and women's footwear, offering styles and sizing for everyone.",
    },
  ],
  finalCta: {
    title: "Create a Pair That's Uniquely Yours",
    description:
      "From premium fabrics and bold colors to signature buckles and perfect sizing, every detail is yours to personalize.",
    subline: "Design today. Wear your identity tomorrow.",
    ctaLabel: "Design Your Shoes",
  },
} as const;

export const aboutContent = {
  hero: {
    title: "Two Decades of Craftsmanship. A New Era of Personalization.",
    description:
      "For over 20 years, Velcraft has been dedicated to crafting premium footwear with exceptional quality and timeless design. What began as a trusted local store has evolved into a modern customization experience, giving every customer the opportunity to create shoes that reflect their own style.",
  },
  story: {
    eyebrow: "Our Story",
    title: "Built on Tradition. Inspired by Innovation.",
    paragraphs: [
      "Velcraft has proudly served customers for more than two decades, earning a reputation for premium craftsmanship, quality materials, and attention to detail.",
      "Around a year ago, we introduced our in-store shoe customization experience, allowing customers to personalize every element of their footwear. The response was overwhelming. Customers loved creating shoes that felt uniquely theirs, turning a simple purchase into a personal design journey.",
      "Today, we're bringing that same experience online, making our customization platform available nationwide so everyone can design footwear that's as unique as they are.",
    ],
  },
  process: {
    eyebrow: "How Customization Works",
    title: "Your Vision, Crafted Step by Step",
    description: "Creating your perfect pair is simple, immersive, and completely personalized.",
    steps: [
      {
        title: "Choose Your Foundation",
        description:
          "Start by selecting the shoe style that best suits your personality or occasion, whether it's classic, modern, or something in between.",
      },
      {
        title: "Personalize Every Detail",
        description:
          "Bring your design to life by choosing from 20+ colors, premium fabric options, 10+ distinctive buckle designs, sole color and style, and a complete men's and women's size ranges.",
      },
      {
        title: "Preview in Real Time",
        description:
          "Our interactive 360° 3D configurator updates instantly as you customize, allowing you to rotate the shoe and view every detail from every angle before placing your order.",
      },
      {
        title: "Crafted with Care",
        description:
          "Once your design is finalized, our skilled craftsmen carefully produce your footwear using premium materials and meticulous attention to detail, ensuring every pair meets the standards Velcraft has upheld for over 20 years.",
      },
    ],
  },
  whyChoose: {
    eyebrow: "Why Choose Velcraft?",
    title: "Luxury Meets Personal Expression",
    items: [
      "Over 20 years of footwear craftsmanship",
      "Nationwide access to our exclusive customization platform",
      "Interactive 3D shoe designer",
      "Premium-quality materials and finishes",
      "Personalized designs made exclusively for you",
      "Footwear for both men and women",
    ],
  },
  faqs: [
    {
      question: "How long has Velcraft been in business?",
      answer:
        "Velcraft has been crafting premium footwear for over 20 years, serving customers with quality, craftsmanship, and timeless designs.",
    },
    {
      question: "When was the customization service introduced?",
      answer:
        "Our customization experience began in-store about a year ago. After receiving exceptional customer feedback and demand, we've expanded it nationwide through our online platform.",
    },
    {
      question: "How does the 3D customization process work?",
      answer:
        "Simply choose a shoe style, customize its colors, fabrics, buckles, soles, and size, then preview every change instantly using our interactive 360° 3D model before placing your order.",
    },
    {
      question: "Can I rotate the shoe while designing?",
      answer:
        "Yes. The 3D model can be viewed from multiple angles, helping you inspect every detail of your custom design before confirming your purchase.",
    },
    {
      question: "What materials are available?",
      answer:
        "We offer premium-quality materials, including synthetic leather and suede, selected for their durability, comfort, and refined finish.",
    },
    {
      question: "Can I customize shoes for both men and women?",
      answer:
        "Absolutely. Velcraft offers customization for both men's and women's footwear with styles and sizes designed for everyone.",
    },
    {
      question: "Are custom shoes made after I place an order?",
      answer:
        "Yes. Every customized pair is crafted after your order is confirmed, ensuring your footwear is made specifically to your chosen design.",
    },
    {
      question: "Can I order ready-made shoes as well?",
      answer:
        "Yes. Alongside our customization service, we also offer a curated collection of ready-made footwear for customers who prefer classic designs.",
    },
    {
      question: "Why choose custom footwear?",
      answer:
        "Custom footwear allows you to express your individual style while enjoying premium craftsmanship, personalized details, and a design that's uniquely yours.",
    },
  ],
  finalCta: {
    title: "Crafted Through Experience. Personalized for You.",
    description:
      "Twenty years of craftsmanship. Endless possibilities for customization. Design a pair that reflects your personality and experience footwear made exclusively for you.",
    ctaLabel: "Start Your Custom Design",
  },
} as const;

export const contactContent = {
  hero: {
    title: "We're Here to Help",
    description:
      "Have a question about your order, customization options, or sizing? Our team is ready to assist you every step of the way.",
  },
  info: {
    sectionTitle: "Contact Information",
    title: "Get in Touch",
    description: "Reach out through your preferred method, and we'll respond as quickly as possible.",
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    hours: siteConfig.contact.hours,
    address: siteConfig.contact.address,
  },
  form: {
    title: "Send Us a Message",
    description: "Whether you need support or have a custom request, we'd love to hear from you.",
    submitLabel: "Send Message",
  },
  faqPrompt: {
    title: "Need Answers Faster?",
    description:
      "Visit our FAQ section to find quick answers to the most common questions about customization, sizing, materials, and orders.",
    ctaLabel: "View FAQs",
    ctaHref: "/#faq",
  },
} as const;

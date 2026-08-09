import { siteConfig } from "@/config/site";

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PolicyDocument {
  title: string;
  updatedAt: string;
  intro: string;
  sections: PolicySection[];
}

const business = {
  name: siteConfig.name,
  email: siteConfig.contact.email,
  phone: siteConfig.contact.phone,
  address: siteConfig.contact.address,
  hours: siteConfig.contact.hours,
  bank: siteConfig.payments.bankTransfer.bankName,
  delivery: siteConfig.deliveryTimeline,
  shippingFee: siteConfig.shippingFlat,
  currency: siteConfig.currency,
};

export const policyDocuments = {
  privacy: {
    title: "Privacy Policy",
    updatedAt: "July 22, 2026",
    intro: `${business.name} ("we", "our", "us") respects your privacy. This policy explains how we collect, use, store, and protect personal information when you browse our website, customize products, create an account, or place an order.`,
    sections: [
      {
        heading: "Information We Collect",
        paragraphs: ["We may collect the following information when you use our services:"],
        bullets: [
          "Account details such as name, email address, phone number, and password.",
          "Order and checkout information including shipping address, billing details, and payment method selection.",
          "Customization preferences including size, color, material, and design selections.",
          "Communication records when you contact us by email, phone, WhatsApp, or contact form.",
          "Technical data such as browser type, device information, and cookies required for site functionality.",
        ],
      },
      {
        heading: "How We Use Your Information",
        paragraphs: ["We use personal data to:"],
        bullets: [
          "Process and deliver orders across Pakistan.",
          "Provide customer support and order updates.",
          "Operate our customization studio and product catalog.",
          "Prevent fraud, secure payments, and comply with legal obligations.",
          "Improve our website, products, and customer experience.",
        ],
      },
      {
        heading: "Payment Information",
        paragraphs: [
          "Card payments are processed securely through PayFast. We do not store full debit or credit card numbers on our servers. Payment partners may process transaction data according to their own privacy and security standards.",
          "For bank transfer and cash on delivery orders, we retain only the information required to confirm payment and fulfill your order.",
        ],
      },
      {
        heading: "Sharing of Information",
        paragraphs: [
          "We do not sell your personal information. We may share data only with trusted service providers such as payment gateways, courier partners, and hosting providers when necessary to complete your order or operate our business.",
        ],
      },
      {
        heading: "Data Retention",
        paragraphs: [
          "We retain order and account information for as long as needed to fulfill orders, provide support, resolve disputes, and meet legal or accounting requirements.",
        ],
      },
      {
        heading: "Your Rights",
        paragraphs: [
          "You may request access, correction, or deletion of your personal information by contacting us. We will respond within a reasonable timeframe subject to applicable law.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `Questions about this policy may be sent to ${business.email}, ${business.phone}, or ${business.address}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    updatedAt: "July 22, 2026",
    intro: `These Terms of Service govern your use of the ${business.name} website, customization tools, and purchase services. By accessing our website or placing an order, you agree to these terms.`,
    sections: [
      {
        heading: "Use of Website",
        paragraphs: [
          "You agree to use our website lawfully and not to misuse, copy, disrupt, or attempt unauthorized access to our services, product assets, or customer accounts.",
        ],
      },
      {
        heading: "Products & Custom Orders",
        paragraphs: [
          "Product images, colors, and materials are shown as accurately as possible. Minor variations may occur due to screen settings, handcrafted production, or material availability.",
          "Customized and made-to-order footwear is produced according to the specifications selected at checkout or in the customization studio.",
        ],
      },
      {
        heading: "Pricing & Availability",
        paragraphs: [
          `All prices are listed in ${business.currency} unless stated otherwise. We reserve the right to update prices, product availability, or promotions at any time. Confirmed orders are charged at the price shown at checkout.`,
        ],
      },
      {
        heading: "Orders & Acceptance",
        paragraphs: [
          "Placing an order constitutes an offer to purchase. We may accept or decline an order due to stock, payment verification, address issues, or suspected fraud.",
          "Order confirmation does not guarantee immediate dispatch until payment is verified where applicable.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "All website content, branding, product photography, design assets, and software remain the property of Velcraft or its licensors and may not be reproduced without permission.",
        ],
      },
      {
        heading: "Limitation of Liability",
        paragraphs: [
          "To the fullest extent permitted by law, Velcraft is not liable for indirect, incidental, or consequential damages arising from use of the website or delayed delivery caused by events outside our reasonable control.",
        ],
      },
      {
        heading: "Governing Law",
        paragraphs: [
          "These terms are governed by the laws of Pakistan. Disputes shall first be attempted to be resolved through good-faith customer support.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `For questions about these terms, contact us at ${business.email} or ${business.phone}.`,
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    updatedAt: "July 22, 2026",
    intro: `${business.name} aims to provide a premium product and service experience. This Refund Policy explains when refunds may be issued for orders placed on our website.`,
    sections: [
      {
        heading: "Eligible Refunds",
        paragraphs: ["Refunds may be approved in the following cases:"],
        bullets: [
          "The item received is defective or damaged due to production fault.",
          "The wrong product or size was delivered due to our error.",
          "An order was charged but not fulfilled.",
          "A duplicate payment was processed in error.",
        ],
      },
      {
        heading: "Non-Refundable Cases",
        paragraphs: ["Refunds are generally not available for:"],
        bullets: [
          "Customized or made-to-order products unless defective or incorrect.",
          "Products showing normal wear after use.",
          "Orders cancelled after production has started, except where required by law.",
          "Shipping fees on non-defective returns, unless the return is due to our error.",
        ],
      },
      {
        heading: "Refund Method",
        paragraphs: [
          "Approved refunds are returned using the original payment method where possible.",
          "Card payments refunded via PayFast may take 5–10 business days depending on the bank.",
          "Bank transfer refunds are sent to the verified account provided by the customer.",
          "Cash on delivery refunds may be processed via bank transfer or another agreed method.",
        ],
      },
      {
        heading: "How to Request a Refund",
        paragraphs: [
          `Contact us within 7 days of delivery at ${business.email} or ${business.phone} with your order number, photos of the issue, and a brief description. Our team will review and respond within 2–3 business days.`,
        ],
      },
      {
        heading: "Processing Time",
        paragraphs: [
          "Once approved, refunds are initiated within 3–5 business days. Bank and payment gateway processing times may vary.",
        ],
      },
    ],
  },
  returns: {
    title: "Return & Exchange Policy",
    updatedAt: "July 22, 2026",
    intro: `This policy explains how returns and exchanges are handled for ${business.name} orders within Pakistan.`,
    sections: [
      {
        heading: "Return Window",
        paragraphs: [
          "Standard ready-to-wear catalog items may be returned within 7 days of delivery if unused, unworn, and in original packaging with tags intact.",
          "Customized or bespoke orders are made to your selected specifications and are not eligible for return unless defective or incorrectly fulfilled by us.",
        ],
      },
      {
        heading: "Exchange Policy",
        paragraphs: [
          "Size exchanges may be offered on eligible standard products subject to stock availability.",
          "If the requested size is unavailable, we may offer a store credit or refund according to our Refund Policy.",
        ],
      },
      {
        heading: "Return Conditions",
        paragraphs: ["To qualify for a return or exchange, items must:"],
        bullets: [
          "Be in new, unworn condition with original packaging.",
          "Include proof of purchase or order number.",
          "Be free from damage caused by the customer.",
          "Be approved by our customer care team before dispatch back to us.",
        ],
      },
      {
        heading: "Return Shipping",
        paragraphs: [
          "Customers are responsible for return shipping unless the return is due to our error or a defective product.",
          "We recommend using a trackable courier service. Velcraft is not responsible for items lost in return transit without proof of shipment.",
        ],
      },
      {
        heading: "How to Start a Return",
        paragraphs: [
          `Email ${business.email} or message us on WhatsApp at ${business.phone} with your order number, reason for return, and photos. We will provide return instructions if approved.`,
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    updatedAt: "July 22, 2026",
    intro: `${business.name} delivers across Pakistan. This policy outlines shipping fees, timelines, and delivery terms.`,
    sections: [
      {
        heading: "Delivery Areas",
        paragraphs: [
          "We currently ship to addresses within Pakistan. Delivery availability to remote areas may depend on courier coverage.",
        ],
      },
      {
        heading: "Shipping Fee",
        paragraphs: [
          `A flat shipping fee of PKR ${business.shippingFee.toLocaleString("en-PK")} applies to qualifying orders unless a promotion states otherwise. The shipping amount is shown at checkout before payment.`,
        ],
      },
      {
        heading: "Production & Dispatch",
        paragraphs: [
          `Most orders are produced and dispatched within ${business.delivery}. Customized products may require additional production time depending on specifications.`,
          "You will receive order confirmation after checkout. Tracking or dispatch updates may be shared by email, phone, or WhatsApp when available.",
        ],
      },
      {
        heading: "Delivery Timeline",
        paragraphs: [
          "Estimated delivery times vary by city and courier partner. Major cities typically receive orders faster than remote locations.",
          "Delivery timelines are estimates and may be affected by holidays, weather, courier delays, or high order volume.",
        ],
      },
      {
        heading: "Failed Delivery",
        paragraphs: [
          "If delivery fails due to an incorrect address, unavailability, or refusal to accept a cash on delivery order, additional re-delivery fees may apply.",
          "Please ensure your phone number and shipping address are accurate at checkout.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `For delivery questions, contact ${business.email} or ${business.phone}. Support hours: ${business.hours}.`,
        ],
      },
    ],
  },
  payment: {
    title: "Payment Policy",
    updatedAt: "July 22, 2026",
    intro: `${business.name} offers multiple secure payment options for customers in Pakistan. This policy describes available methods and how payments are processed.`,
    sections: [
      {
        heading: "Accepted Payment Methods",
        paragraphs: ["We currently accept the following payment methods:"],
        bullets: [
          "Debit / Credit Card via PayFast secure checkout.",
          "Cash on Delivery (COD) for eligible orders within Pakistan.",
          `Bank transfer to our ${business.bank} merchant account.`,
        ],
      },
      {
        heading: "Card Payments (PayFast)",
        paragraphs: [
          "Card payments are processed through PayFast, a licensed payment gateway. You will be redirected to a secure PayFast page to complete payment.",
          "Velcraft does not store full card details on its servers. Settlement of card payments is processed according to PayFast and banking partner timelines to our merchant bank account.",
        ],
      },
      {
        heading: "Cash on Delivery",
        paragraphs: [
          "COD allows you to pay in cash when the order is delivered. Please keep the exact or approximate amount ready where possible.",
          "Velcraft may limit COD availability for high-value orders or certain locations.",
        ],
      },
      {
        heading: "Bank Transfer",
        paragraphs: [
          `Transfer the order total to our ${business.bank} account shown at checkout. Use your order number as the payment reference and email proof of payment to ${business.email}.`,
          "Orders paid by bank transfer are processed after payment verification.",
        ],
      },
      {
        heading: "Currency",
        paragraphs: [
          `All transactions are processed in ${business.currency} (Pakistani Rupee).`,
        ],
      },
      {
        heading: "Payment Security",
        paragraphs: [
          "We use industry-standard security practices and trusted payment partners. Never share your OTP, PIN, or full card details with unauthorized persons claiming to represent Velcraft.",
        ],
      },
      {
        heading: "Failed or Disputed Payments",
        paragraphs: [
          "If a payment fails, you may retry checkout or choose another payment method. For duplicate charges or disputes, contact us with your order number and transaction reference within 48 hours.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `Payment support: ${business.email} | ${business.phone} | ${business.address}`,
        ],
      },
    ],
  },
} satisfies Record<string, PolicyDocument>;

export type PolicySlug = keyof typeof policyDocuments;

export const policyLinks: Array<{ slug: PolicySlug; href: string; label: string }> = [
  { slug: "privacy", href: "/privacy", label: "Privacy Policy" },
  { slug: "terms", href: "/terms", label: "Terms of Service" },
  { slug: "refund", href: "/refund-policy", label: "Refund Policy" },
  { slug: "returns", href: "/returns-policy", label: "Returns & Exchanges" },
  { slug: "shipping", href: "/shipping-policy", label: "Shipping & Delivery" },
  { slug: "payment", href: "/payment-policy", label: "Payment Policy" },
];

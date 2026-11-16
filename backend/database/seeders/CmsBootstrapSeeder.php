<?php

namespace Database\Seeders;

use App\Models\PageSection;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

/**
 * Safe for production: upserts CMS settings/page sections only.
 * Does not touch users, orders, catalog, or passwords.
 */
class CmsBootstrapSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::query()->updateOrCreate(['key' => 'brand'], [
            'value' => [
                'name' => 'Velcraft',
                'tagline' => 'Bespoke luxury footwear',
                'description' => 'Design footwear that\'s made to match your style. Customize colors, premium fabrics, buckles, soles, and sizes in our interactive 3D designer.',
                'logo_path' => 'images/logo/velcraft-logo.png',
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'newsletter'], [
            'value' => [
                'title' => 'Join the Atelier List',
                'description' => 'Receive early access to new collections and bespoke customization drops.',
                'enabled' => true,
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'contact'], [
            'value' => [
                'title' => 'Get in Touch',
                'description' => 'Reach out through your preferred method, and we\'ll respond as quickly as possible.',
                'email' => 'ajshoes@velcraftpk.com',
                'phone' => '+92 304 2568744',
                'whatsapp' => '+92 304 2568744',
                'whatsapp_message' => 'Hi Velcraft, I would like to know more about your custom shoes.',
                'hours' => 'Monday - Saturday, 12:00 PM - 10:00 PM (PKT)',
                'address' => 'Dolmen Center, Tariq Road, Karachi, Pakistan',
                'map_url' => 'https://maps.google.com/?q=Dolmen+Center+Tariq+Road+Karachi',
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'navigation'], [
            'value' => [
                'items' => [
                    ['label' => 'Home', 'href' => '/'],
                    ['label' => 'About', 'href' => '/about'],
                    ['label' => 'Collection', 'href' => '/collection'],
                    ['label' => 'Customization', 'href' => '/customize/studio-loafer'],
                    ['label' => 'Contact', 'href' => '/contact'],
                ],
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'header'], [
            'value' => [
                'announcement_items' => [
                    'Complimentary EU sizing guidance',
                    '7–10 business day delivery',
                    'Bespoke craftsmanship',
                ],
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'footer'], [
            'value' => [
                'blurb' => 'Bespoke luxury footwear crafted with precision and soul.',
                'highlights' => [
                    ['title' => 'Made to order', 'body' => 'Every pair is crafted after you finalize your design.'],
                    ['title' => 'Concierge support', 'body' => 'WhatsApp and email help for sizing and customization.'],
                ],
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'commerce'], [
            'value' => [
                'currency' => 'PKR',
                'shipping_flat' => 2500,
                'delivery_timeline' => '7–10 business days',
                'default_country' => 'PK',
                'country_name' => 'Pakistan',
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'payments'], [
            'value' => [
                'cod' => [
                    'label' => 'Cash on Delivery',
                    'description' => 'Pay in cash when your order arrives at your doorstep.',
                ],
                'bank_transfer' => [
                    'label' => 'Bank Transfer',
                    'description' => 'Transfer the order total to our bank account and share payment proof by email.',
                    'bank_name' => 'Meezan Bank',
                    'account_title' => 'Velcraft',
                    'account_number' => '01234567890123',
                    'iban' => 'PK00MEZN0000123456789012',
                ],
                'card' => [
                    'label' => 'Debit / Credit Card',
                    'description' => 'Pay securely with card via PayFast.',
                    'provider' => 'PayFast',
                ],
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'customize_page'], [
            'value' => [
                'eyebrow' => 'Customization Studio',
                'title' => 'Our Studio',
                'description' => 'Customize every detail, from material and color to buckle, sole, and fit, with an interactive live preview. Exclusively designed for our signature customizable shoe style.',
            ],
        ]);

        $sections = [
            [
                'page_key' => 'home',
                'section_key' => 'products',
                'eyebrow' => 'Shop Collection',
                'title' => 'Signature Styles, Ready to Wear',
                'description' => 'Explore our curated mule collection with premium fabrics, signature buckles, and sizes for men and women.',
                'body_json' => [
                    'stats' => [
                        ['label' => 'Premium colors', 'value' => '20+'],
                        ['label' => 'Buckle designs', 'value' => '10+'],
                        ['label' => 'Unisex sizing', 'value' => 'Men & Women'],
                    ],
                ],
                'sort_order' => 1,
            ],
            [
                'page_key' => 'home',
                'section_key' => 'trust',
                'eyebrow' => 'The Velcraft Standard',
                'body_json' => [
                    'items' => [
                        'Premium materials',
                        'Made-to-order craftsmanship',
                        'Interactive 3D design',
                        'EU sizing guidance',
                        'Secure checkout',
                        'Nationwide delivery',
                    ],
                ],
                'sort_order' => 2,
            ],
            [
                'page_key' => 'home',
                'section_key' => 'atelier',
                'eyebrow' => 'Crafted Around Your Style',
                'title' => 'See It. Customize It. Wear It.',
                'description' => 'Experience your design before it reaches your doorstep. Our real-time 3D configurator lets you visualize every change instantly.',
                'body_json' => [
                    'features' => [
                        '5+ customizations',
                        'Premium craftsmanship',
                        'Personalized to your preferences',
                        'Stylish, comfortable, and built to last',
                        'Secure ordering and reliable delivery',
                    ],
                ],
                'cta_label' => 'Start Designing',
                'cta_url' => '/customize/studio-loafer',
                'sort_order' => 3,
            ],
            [
                'page_key' => 'home',
                'section_key' => 'testimonials',
                'eyebrow' => 'Customer Reviews',
                'title' => 'Loved by Every Step',
                'sort_order' => 4,
            ],
            [
                'page_key' => 'home',
                'section_key' => 'faq',
                'eyebrow' => 'FAQ',
                'title' => 'Questions, Answered',
                'body_json' => [
                    'faqs' => [
                        ['question' => 'Can I customize every part of the shoe?', 'answer' => 'Yes. Personalize colors, premium fabrics, buckles, soles, sizes, and shoe styles through our interactive 3D designer.'],
                        ['question' => 'How many colors can I choose from?', 'answer' => 'We offer 20+ carefully selected colors, with new options added regularly.'],
                        ['question' => 'What buckle options are available?', 'answer' => 'Choose from 10+ buckle designs, ranging from classic finishes to bold contemporary styles.'],
                        ['question' => 'Do you offer sizes for everyone?', 'answer' => 'Absolutely. We provide a complete size range for both men and women to ensure the perfect fit.'],
                        ['question' => 'Can I see my design before ordering?', 'answer' => 'Yes. Our live 3D configurator updates instantly, allowing you to preview every customization before placing your order.'],
                    ],
                ],
                'sort_order' => 5,
            ],
            [
                'page_key' => 'home',
                'section_key' => 'final_cta',
                'title' => 'Create a Pair That\'s Uniquely Yours',
                'description' => 'From premium fabrics and bold colors to signature buckles and perfect sizing, every detail is yours to personalize.',
                'body_json' => ['subline' => 'Design today. Wear your identity tomorrow.'],
                'cta_label' => 'Design Your Shoes',
                'cta_url' => '/customize/studio-loafer',
                'sort_order' => 6,
            ],
            [
                'page_key' => 'about',
                'section_key' => 'hero',
                'title' => 'Two Decades of Craftsmanship. A New Era of Personalization.',
                'description' => 'For over 20 years, Velcraft has been dedicated to crafting premium footwear with exceptional quality and timeless design.',
                'sort_order' => 1,
            ],
            [
                'page_key' => 'contact',
                'section_key' => 'hero',
                'title' => 'We\'re Here to Help',
                'description' => 'Have a question about your order, customization options, or sizing? Our team is ready to assist you every step of the way.',
                'sort_order' => 1,
            ],
            [
                'page_key' => 'collection',
                'section_key' => 'hero',
                'eyebrow' => 'Collection',
                'title' => 'Signature silhouettes for every step',
                'description' => 'Browse our men\'s collection of ready-to-wear mules, or open customization to design your own.',
                'sort_order' => 1,
            ],
            [
                'page_key' => 'customize',
                'section_key' => 'hero',
                'eyebrow' => 'Customization Studio',
                'title' => 'Our Studio',
                'description' => 'Customize every detail, from material and color to buckle, sole, and fit, with an interactive live preview. Exclusively designed for our signature customizable shoe style.',
                'sort_order' => 1,
            ],
        ];

        foreach ($sections as $section) {
            PageSection::query()->updateOrCreate(
                [
                    'page_key' => $section['page_key'],
                    'section_key' => $section['section_key'],
                ],
                [
                    'eyebrow' => $section['eyebrow'] ?? null,
                    'title' => $section['title'] ?? null,
                    'description' => $section['description'] ?? null,
                    'body_json' => $section['body_json'] ?? null,
                    'image_path' => $section['image_path'] ?? null,
                    'cta_label' => $section['cta_label'] ?? null,
                    'cta_url' => $section['cta_url'] ?? null,
                    'sort_order' => $section['sort_order'] ?? 0,
                    'is_active' => true,
                ]
            );
        }
    }
}

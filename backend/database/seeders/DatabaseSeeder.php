<?php

namespace Database\Seeders;

use App\Enums\CouponType;
use App\Enums\UserRole;
use App\Models\Buckle;
use App\Models\Collection;
use App\Models\Color;
use App\Models\Coupon;
use App\Models\HeroSlide;
use App\Models\Material;
use App\Models\ProcessStep;
use App\Models\Shoe;
use App\Models\SiteSetting;
use App\Models\Size;
use App\Models\SoleColor;
use App\Models\Testimonial;
use App\Models\User;
use App\Models\WhyChooseItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@velcraft.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin@123'),
                'role' => UserRole::Admin,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'customer@customshoes.com'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('password'),
                'role' => UserRole::Customer,
            ]
        );

        SiteSetting::query()->updateOrCreate(['key' => 'brand'], [
            'value' => [
                'name' => 'Velcraft',
                'tagline' => 'Bespoke luxury footwear crafted with precision and soul.',
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'newsletter'], [
            'value' => [
                'title' => 'Join the Atelier List',
                'description' => 'Receive early access to new collections and bespoke customization drops.',
            ],
        ]);

        SiteSetting::query()->updateOrCreate(['key' => 'contact'], [
            'value' => [
                'title' => 'Get in Touch',
                'description' => 'Reach out through your preferred method, and we\'ll respond as quickly as possible.',
                'email' => 'ajshoes@velcraftpk.com',
                'phone' => '+92 304 2568744',
                'hours' => 'Monday - Saturday, 12:00 PM - 10:00 PM (PKT)',
                'address' => 'Dolmen Center, Tariq Road, Karachi, Pakistan',
            ],
        ]);

        $this->seedCatalog();
        $this->seedHomepageContent();
        $this->seedCoupons();
    }

    private function seedCoupons(): void
    {
        Coupon::query()->updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => CouponType::Percentage,
                'value' => 10,
                'min_order_amount' => 3000,
                'is_active' => true,
            ]
        );
    }

    private function seedCatalog(): void
    {
        $materials = collect([
            ['name' => 'Suede', 'slug' => 'suede', 'texture_path' => 'textures/suede.jpg', 'price_modifier' => 0],
            ['name' => 'Synthetic Leather', 'slug' => 'synthetic-leather', 'texture_path' => 'textures/synthetic-leather.jpg', 'price_modifier' => 0],
            ['name' => 'Premium Leather', 'slug' => 'premium-leather', 'texture_path' => 'textures/synthetic-leather.jpg', 'price_modifier' => 0],
            ['name' => 'Velvet', 'slug' => 'velvet', 'texture_path' => 'textures/suede.jpg', 'price_modifier' => 0],
        ])->map(fn (array $data) => Material::query()->updateOrCreate(['slug' => $data['slug']], $data));

        $colors = collect([
            ['name' => 'Charcoal Black', 'hex_code' => '#3D312D', 'swatch_path' => 'images/colors/charcoal-black.jpg'],
            ['name' => 'Charcoal Grey', 'hex_code' => '#7C615D', 'swatch_path' => 'images/colors/charcoal-grey.jpg'],
            ['name' => 'Coral', 'hex_code' => '#9B4534', 'swatch_path' => 'images/colors/coral.jpg'],
            ['name' => 'Dark Brown', 'hex_code' => '#3F1C16', 'swatch_path' => 'images/colors/dark-brown.jpg'],
            ['name' => 'Dark Grey', 'hex_code' => '#564D48', 'swatch_path' => 'images/colors/dark-grey.jpg'],
            ['name' => 'Grey', 'hex_code' => '#AFA299', 'swatch_path' => 'images/colors/grey.jpg'],
            ['name' => 'Light Brown', 'hex_code' => '#744438', 'swatch_path' => 'images/colors/light-brown.jpg'],
            ['name' => 'Mauve', 'hex_code' => '#846B64', 'swatch_path' => 'images/colors/mauve.jpg'],
            ['name' => 'Navy Blue', 'hex_code' => '#463851', 'swatch_path' => 'images/colors/navy-blue.jpg'],
        ])->map(fn (array $data, int $index) => Color::query()->updateOrCreate(
            ['name' => $data['name']],
            [...$data, 'is_active' => true, 'sort_order' => $index + 1]
        ));

        // Keep legacy inactive palette rows so old pivots don't break references.
        // "Black" removed from the active upper-color picker (was first).
        Color::query()
            ->whereNotIn('name', $colors->pluck('name'))
            ->update(['is_active' => false]);

        collect([
            ['name' => 'Black', 'slug' => 'black', 'hex_code' => '#111111'],
            ['name' => 'White', 'slug' => 'white', 'hex_code' => '#FFFFFF'],
        ])->each(fn (array $data, int $index) => SoleColor::query()->updateOrCreate(
            ['slug' => $data['slug']],
            [...$data, 'sort_order' => $index + 1]
        ));

        $womenSizes = collect([35, 36, 37, 38])->map(fn (int $size, int $index) => Size::query()->updateOrCreate(
            ['gender' => 'women', 'value' => $size],
            ['label' => (string) $size, 'sort_order' => $index + 1]
        ));

        $menSizes = collect([40, 41, 42, 43, 44, 45])->map(fn (int $size, int $index) => Size::query()->updateOrCreate(
            ['gender' => 'men', 'value' => $size],
            ['label' => (string) $size, 'sort_order' => $index + 1]
        ));

        Buckle::query()->whereIn('slug', ['classic-oval', 'heritage-square', 'minimal-bar'])->update(['is_active' => false]);

        $buckles = collect([
            ['name' => 'Logo Plaque', 'slug' => 'buckle-01', 'model_path' => 'models/buckles/buckle_01.glb', 'thumbnail_path' => 'images/buckles/buckle_01.png'],
            ['name' => 'Medallion Mesh', 'slug' => 'buckle-02', 'model_path' => 'models/buckles/buckle_02.glb', 'thumbnail_path' => 'images/buckles/buckle_02.png'],
            ['name' => 'Twin Horsebit', 'slug' => 'buckle-03', 'model_path' => 'models/buckles/buckle_03.glb', 'thumbnail_path' => 'images/buckles/buckle_03.png'],
            ['name' => 'Chain Link Bar', 'slug' => 'buckle-04', 'model_path' => 'models/buckles/buckle_04.glb', 'thumbnail_path' => 'images/buckles/buckle_04.png'],
            ['name' => 'Classic Bit', 'slug' => 'buckle-05', 'model_path' => 'models/buckles/buckle_05.glb', 'thumbnail_path' => 'images/buckles/buckle_05.png'],
            ['name' => 'Ornate Crest', 'slug' => 'buckle-06', 'model_path' => 'models/buckles/buckle_06.glb', 'thumbnail_path' => 'images/buckles/buckle_06.png'],
            ['name' => 'Slim Metal Bar', 'slug' => 'buckle-07', 'model_path' => 'models/buckles/buckle_07.glb', 'thumbnail_path' => 'images/buckles/buckle_07.png'],
            ['name' => 'Double Ring', 'slug' => 'buckle-08', 'model_path' => 'models/buckles/buckle_08.glb', 'thumbnail_path' => 'images/buckles/buckle_08.png'],
            ['name' => 'Heritage Plate', 'slug' => 'buckle-09', 'model_path' => 'models/buckles/buckle_09.glb', 'thumbnail_path' => 'images/buckles/buckle_09.png'],
            ['name' => 'Studio Emblem', 'slug' => 'buckle-10', 'model_path' => 'models/buckles/buckle_10.glb', 'thumbnail_path' => 'images/buckles/buckle_10.png'],
        ])->map(fn (array $data, int $index) => Buckle::query()->updateOrCreate(
            ['slug' => $data['slug']],
            [...$data, 'sort_order' => $index + 1, 'price_modifier' => $index * 50, 'is_active' => true]
        ));

        $signature = Collection::query()->updateOrCreate(['slug' => 'signature'], [
            'name' => 'Impression',
            'description' => 'Refined backless silhouettes in premium suede and velvet finishes.',
            'image_path' => 'images/collections/signature.jpg',
            'sort_order' => 3,
        ]);

        Collection::query()->updateOrCreate(['slug' => 'men'], [
            'name' => 'Men',
            'description' => 'Curated boots, mules, and backless styles for men.',
            'image_path' => 'images/collections/men.jpg',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $men = Collection::query()->where('slug', 'men')->firstOrFail();

        Collection::query()->updateOrCreate(['slug' => 'women'], [
            'name' => 'Women',
            'description' => 'Elegant silhouettes for women — coming soon.',
            'image_path' => 'images/collections/women.jpg',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $heritage = Collection::query()->updateOrCreate(['slug' => 'heritage'], [
            'name' => 'Heritage Classics',
            'description' => 'Horsebit details and rich leather tones for elevated everyday wear.',
            'image_path' => 'images/collections/evening.jpg',
            'sort_order' => 4,
            'is_active' => false,
        ]);

        $defaultModel = 'ivory-gold-bit-mule';
        $backlessModel = 'noir-minimal-mule';
        $studioModel = 'studio-loafer';

        $shoes = [
            [
                'collection_id' => $men->id,
                'name' => 'Studio Loafer',
                'slug' => 'studio-loafer',
                'description' => 'Clean blank loafer for full customization — backless mule or covered heel.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/studio-loafer/main.png',
                'body_model_path' => "models/shoes/{$studioModel}/shoe.glb",
                'sole_model_path' => "models/shoes/{$studioModel}/shoe.glb",
                'logo_model_path' => "models/shoes/{$studioModel}/shoe.glb",
                'inner_model_path' => "models/shoes/{$studioModel}/shoe.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['backless', 'covered'],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Black Boot',
                'slug' => 'black-boot',
                'description' => 'Black boot with a structured silhouette and premium finish.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/catalog-extra/black-boot-2.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['covered'],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Brown Boot',
                'slug' => 'brown-boot',
                'description' => 'Brown boot crafted in a rich tone with everyday versatility.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/brown-boot/main.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['covered'],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Dark Blue Covered',
                'slug' => 'dark-blue-covered',
                'description' => 'Dark blue covered mule with a refined, polished profile.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/catalog-extra/blue-covered-2.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['covered'],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Black Covered',
                'slug' => 'black-covered',
                'description' => 'Classic black covered style with a sleek, minimal finish.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/noir-minimal-mule/black-covered-2.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_02.glb',
                'supported_types' => ['covered'],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Medium Brown Covered',
                'slug' => 'medium-brown-covered',
                'description' => 'Coffee brown covered mule with warm, elegant tones.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/medium-brown-covered/main.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['covered'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Brown Covered',
                'slug' => 'brown-covered',
                'description' => 'Medium brown covered mule with a soft, natural finish.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/brown-covered/main.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['covered'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Brown Diff Buckle',
                'slug' => 'brown-diff-buckle',
                'description' => 'Dark brown style featuring a distinctive buckle detail.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/brown-diff-buckle/main.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_03.glb',
                'supported_types' => ['backless', 'covered'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Dark Brown Covered',
                'slug' => 'dark-brown-covered',
                'description' => 'Dark brown covered mule with deep, sophisticated coloring.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/dark-brown-covered/main.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['covered'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 8,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Charcoal',
                'slug' => 'charcoal',
                'description' => 'Charcoal-toned mule with a muted, modern aesthetic.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/charcoal/main.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_02.glb',
                'supported_types' => ['covered'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 9,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Faune',
                'slug' => 'faune',
                'description' => 'Faune-colored mule with a soft, neutral palette.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/catalog-extra/faune-3.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['covered'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Grey',
                'slug' => 'grey',
                'description' => 'Grey mule with understated elegance and versatile styling.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/grey/main.png',
                'body_model_path' => "models/shoes/{$defaultModel}/body.glb",
                'sole_model_path' => "models/shoes/{$defaultModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$defaultModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$defaultModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_02.glb',
                'supported_types' => ['covered'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Full Black Backless',
                'slug' => 'full-black-backless',
                'description' => 'Full black backless mule with a clean, open heel profile.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/full-black-backless/main.png',
                'body_model_path' => "models/shoes/{$backlessModel}/body.glb",
                'sole_model_path' => "models/shoes/{$backlessModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$backlessModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$backlessModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_02.glb',
                'supported_types' => ['backless'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 12,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Black and White Backless',
                'slug' => 'black-and-white-backless',
                'description' => 'Black and white backless mule with bold contrast detailing.',
                'base_price' => 2999,
                'thumbnail_path' => 'images/shoes/black-and-white-backless/main.png',
                'body_model_path' => "models/shoes/{$backlessModel}/body.glb",
                'sole_model_path' => "models/shoes/{$backlessModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$backlessModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$backlessModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_02.glb',
                'supported_types' => ['backless'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 13,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Black XL',
                'slug' => 'black-xl',
                'description' => 'Black XL sizing with an extended fit profile.',
                'base_price' => 4500,
                'thumbnail_path' => 'images/shoes/black-xl/main.png',
                'body_model_path' => "models/shoes/{$backlessModel}/body.glb",
                'sole_model_path' => "models/shoes/{$backlessModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$backlessModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$backlessModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_02.glb',
                'supported_types' => ['backless'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 14,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Brown XL',
                'slug' => 'brown-xl',
                'description' => 'Brown XL sizing with an extended fit profile.',
                'base_price' => 4500,
                'thumbnail_path' => 'images/shoes/brown-xl/main.png',
                'body_model_path' => "models/shoes/{$backlessModel}/body.glb",
                'sole_model_path' => "models/shoes/{$backlessModel}/sole.glb",
                'logo_model_path' => "models/shoes/{$backlessModel}/logo.glb",
                'inner_model_path' => "models/shoes/{$backlessModel}/inner.glb",
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['backless'],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 15,
            ],
            [
                'collection_id' => $men->id,
                'name' => 'Ivory Gold Bit Mule',
                'slug' => 'ivory-gold-bit-mule',
                'description' => 'Signature customizable mule — configure fabric, color, buckle, and sole in 3D.',
                'base_price' => 3999,
                'thumbnail_path' => 'images/shoes/ivory-gold-bit-mule.webp',
                'body_model_path' => 'models/shoes/ivory-gold-bit-mule/body.glb',
                'sole_model_path' => 'models/shoes/ivory-gold-bit-mule/sole.glb',
                'logo_model_path' => 'models/shoes/ivory-gold-bit-mule/logo.glb',
                'inner_model_path' => 'models/shoes/ivory-gold-bit-mule/inner.glb',
                'default_buckle_model_path' => 'models/buckles/buckle_01.glb',
                'supported_types' => ['backless', 'covered'],
                'is_featured' => false,
                'is_active' => false,
                'sort_order' => 99,
            ],
        ];

        $catalogSlugs = [
            'black-boot',
            'brown-boot',
            'dark-blue-covered',
            'black-covered',
            'medium-brown-covered',
            'brown-covered',
            'brown-diff-buckle',
            'dark-brown-covered',
            'charcoal',
            'faune',
            'grey',
            'full-black-backless',
            'black-and-white-backless',
            'black-xl',
            'brown-xl',
        ];

        Shoe::query()
            ->whereNotIn('slug', $catalogSlugs)
            ->update(['is_active' => false, 'is_featured' => false]);

        $productAttributes = [
            'black-boot' => ['material' => 'premium-leather', 'color' => 'Charcoal Black', 'buckle' => 'buckle-01'],
            'brown-boot' => ['material' => 'premium-leather', 'color' => 'Dark Brown', 'buckle' => 'buckle-01'],
            'dark-blue-covered' => ['material' => 'velvet', 'color' => 'Navy Blue', 'buckle' => 'buckle-01'],
            'black-covered' => ['material' => 'suede', 'color' => 'Charcoal Black', 'buckle' => 'buckle-01'],
            'medium-brown-covered' => ['material' => 'suede', 'color' => 'Light Brown', 'buckle' => 'buckle-01'],
            'brown-covered' => ['material' => 'suede', 'color' => 'Light Brown', 'buckle' => 'buckle-01'],
            'brown-diff-buckle' => ['material' => 'suede', 'color' => 'Dark Brown', 'buckle' => 'buckle-03'],
            'dark-brown-covered' => ['material' => 'suede', 'color' => 'Dark Brown', 'buckle' => 'buckle-01'],
            'charcoal' => ['material' => 'suede', 'color' => 'Charcoal Black', 'buckle' => 'buckle-01'],
            'faune' => ['material' => 'suede', 'color' => 'Mauve', 'buckle' => 'buckle-01'],
            'grey' => ['material' => 'suede', 'color' => 'Grey', 'buckle' => 'buckle-01'],
            'full-black-backless' => ['material' => 'suede', 'color' => 'Charcoal Black', 'buckle' => 'buckle-01'],
            'black-and-white-backless' => ['material' => 'suede', 'color' => 'Charcoal Grey', 'buckle' => 'buckle-01'],
            'black-xl' => ['material' => 'premium-leather', 'color' => 'Charcoal Black', 'buckle' => 'buckle-01'],
            'brown-xl' => ['material' => 'premium-leather', 'color' => 'Dark Brown', 'buckle' => 'buckle-01'],
            'ivory-gold-bit-mule' => ['material' => 'suede', 'color' => 'Grey', 'buckle' => 'buckle-01', 'all_colors' => true, 'all_materials' => true, 'all_buckles' => true],
        ];

        foreach ($shoes as $shoeData) {
            $shoe = Shoe::query()->updateOrCreate(['slug' => $shoeData['slug']], $shoeData);
            $attributes = $productAttributes[$shoe->slug] ?? null;

            if ($attributes) {
                $shoe->materials()->sync(
                    ($attributes['all_materials'] ?? false)
                        ? $materials->pluck('id')
                        : [$materials->firstWhere('slug', $attributes['material'])?->id]
                );
                $shoe->colors()->sync(
                    ($attributes['all_colors'] ?? false)
                        ? $colors->pluck('id')
                        : [$colors->firstWhere('name', $attributes['color'])?->id]
                );
                $shoe->buckles()->sync(
                    ($attributes['all_buckles'] ?? false)
                        ? $buckles->pluck('id')
                        : [$buckles->firstWhere('slug', $attributes['buckle'])?->id]
                );
            } else {
                $shoe->materials()->sync($materials->pluck('id'));
                $shoe->colors()->sync($colors->pluck('id'));
                $shoe->buckles()->sync($buckles->pluck('id'));
            }

            $shoe->sizes()->sync(
                in_array($shoe->slug, $catalogSlugs, true) || $shoe->slug === 'ivory-gold-bit-mule'
                    ? ($shoe->slug === 'ivory-gold-bit-mule'
                        ? $womenSizes->merge($menSizes)->pluck('id')
                        : $menSizes->pluck('id'))
                    : $womenSizes->merge($menSizes)->pluck('id')
            );
        }
    }

    private function seedHomepageContent(): void
    {
        HeroSlide::query()
            ->whereNotIn('title', ['Your Shoes. Your Signature.'])
            ->update(['is_active' => false]);

        HeroSlide::query()->updateOrCreate(
            ['title' => 'Your Shoes. Your Signature.'],
            [
                'subtitle' => 'Bespoke Luxury Footwear',
                'description' => 'Design footwear that\'s made to match your style—not someone else\'s. Configure materials, colors, buckles, and soles in real time with our interactive 3D atelier.',
                'image_path' => 'images/shoes/catalog-extra/blue-covered-2.png',
                'cta_label' => 'Start Customizing',
                'cta_url' => '/customize/ivory-gold-bit-mule',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $steps = [
            ['title' => 'Choose Your Silhouette', 'description' => 'Select from curated collections engineered for comfort and elegance.', 'icon' => 'shoe'],
            ['title' => 'Configure Every Detail', 'description' => 'Material, color, buckle, sole, and size — all rendered instantly in 3D.', 'icon' => 'palette'],
            ['title' => 'Crafted & Delivered', 'description' => 'Your design enters production with artisan oversight and tracked delivery.', 'icon' => 'truck'],
        ];

        foreach ($steps as $index => $step) {
            ProcessStep::query()->updateOrCreate(
                ['title' => $step['title']],
                [...$step, 'sort_order' => $index + 1]
            );
        }

        $whyItems = [
            ['title' => 'Premium Shoe Fabrics', 'description' => 'Crafted with high-quality leather and suede materials for exceptional comfort, durability, and style.', 'icon' => 'gem'],
            ['title' => 'More than 20 Colors', 'description' => 'Choose from an extensive palette to match every outfit and personality.', 'icon' => 'palette'],
            ['title' => 'Over 10 Buckle Designs', 'description' => 'From timeless classics to modern statement pieces.', 'icon' => 'buckle'],
            ['title' => 'Every Size Available', 'description' => 'A comfortable fit for everyone—because great style starts with the perfect fit.', 'icon' => 'size'],
            ['title' => 'For Men & Women', 'description' => 'Customized footwear for every style, occasion, and individual.', 'icon' => 'people'],
        ];

        foreach ($whyItems as $index => $item) {
            WhyChooseItem::query()->updateOrCreate(
                ['title' => $item['title']],
                [...$item, 'sort_order' => $index + 1]
            );
        }

        WhyChooseItem::query()
            ->whereNotIn('title', array_column($whyItems, 'title'))
            ->delete();

        Testimonial::query()->updateOrCreate(
            ['customer_name' => 'Junaid Zia'],
            [
                'content' => '"The customization experience is incredible." Being able to preview every change in 3D made designing my shoes so easy. The final pair looked exactly like I imagined.',
                'rating' => 5,
                'sort_order' => 1,
            ]
        );

        Testimonial::query()->updateOrCreate(
            ['customer_name' => 'Fizza Shah'],
            [
                'content' => '"Premium quality with endless options." The fabric quality exceeded my expectations, and the buckle choices gave my shoes a completely unique look.',
                'rating' => 5,
                'sort_order' => 2,
            ]
        );

        Testimonial::query()->updateOrCreate(
            ['customer_name' => 'Khurram Khattak'],
            [
                'content' => '"Perfect fit and amazing craftsmanship." Finally found shoes that fit perfectly and reflect my personal style. I\'ll definitely be designing another pair.',
                'rating' => 5,
                'sort_order' => 3,
            ]
        );
    }
}

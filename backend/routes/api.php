<?php

use App\Http\Controllers\Api\V1\Admin\AdminCollectionController;
use App\Http\Controllers\Api\V1\Admin\AdminContactMessageController;
use App\Http\Controllers\Api\V1\Admin\AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\AdminHeroSlideController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminPageSectionController;
use App\Http\Controllers\Api\V1\Admin\AdminProcessStepController;
use App\Http\Controllers\Api\V1\Admin\AdminProductOptionsController;
use App\Http\Controllers\Api\V1\Admin\AdminShoeController;
use App\Http\Controllers\Api\V1\Admin\AdminSiteSettingsController;
use App\Http\Controllers\Api\V1\Admin\AdminTestimonialController;
use App\Http\Controllers\Api\V1\Admin\AdminUploadController;
use App\Http\Controllers\Api\V1\Admin\AdminWhyChooseItemController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CollectionController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\HomepageController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ShippingAddressController;
use App\Http\Controllers\Api\V1\ShoeController;
use App\Http\Controllers\Api\V1\SiteController;
use App\Http\Controllers\Api\V1\WishlistController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/homepage', [HomepageController::class, 'show']);
    Route::get('/site', [SiteController::class, 'show']);
    Route::get('/pages/{pageKey}', [PageController::class, 'show']);
    Route::get('/shoes', [ShoeController::class, 'index']);
    Route::get('/shoes/featured', [ShoeController::class, 'featured']);
    Route::get('/shoes/{slug}', [ShoeController::class, 'show']);
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/collections/{slug}', [CollectionController::class, 'show']);

    Route::get('/contact', [ContactController::class, 'show']);
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');

    Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:newsletter');

    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

        Route::middleware('auth:api')->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
        });
    });

    Route::middleware('optional.jwt')->group(function (): void {
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart/items', [CartController::class, 'store']);
        Route::put('/cart/items/{cartItem}', [CartController::class, 'update']);
        Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroy']);
        Route::delete('/cart', [CartController::class, 'clear']);

        Route::post('/coupons/validate', [CouponController::class, 'validate'])->middleware('throttle:coupons');

        Route::post('/checkout', [OrderController::class, 'store']);

        Route::get('/payments/payfast/status', [PaymentController::class, 'payfastStatus']);
        Route::post('/payments/payfast/checkout', [PaymentController::class, 'createPayfastCheckout']);
        Route::post('/payments/payfast/verify', [PaymentController::class, 'verifyPayfastReturn']);
        Route::post('/payments/payfast/ipn', [PaymentController::class, 'payfastIpn']);

        Route::post('/payments/stripe/intent', [PaymentController::class, 'createStripeIntent']);
        Route::post('/payments/confirm', [PaymentController::class, 'confirm']);
    });

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{wishlistItem}', [WishlistController::class, 'destroy']);

        Route::get('/shipping-addresses', [ShippingAddressController::class, 'index']);
        Route::post('/shipping-addresses', [ShippingAddressController::class, 'store']);
        Route::put('/shipping-addresses/{shippingAddress}', [ShippingAddressController::class, 'update']);
        Route::delete('/shipping-addresses/{shippingAddress}', [ShippingAddressController::class, 'destroy']);

        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
    });

    Route::prefix('admin')->middleware(['auth:api', 'admin'])->group(function (): void {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/collections', [AdminCollectionController::class, 'index']);
        Route::put('/collections/{collection}', [AdminCollectionController::class, 'update']);

        Route::post('/uploads/image', [AdminUploadController::class, 'storeImage']);

        Route::get('/settings', [AdminSiteSettingsController::class, 'index']);
        Route::put('/settings', [AdminSiteSettingsController::class, 'updateMany']);
        Route::get('/settings/{key}', [AdminSiteSettingsController::class, 'show']);
        Route::put('/settings/{key}', [AdminSiteSettingsController::class, 'update']);

        Route::get('/hero-slides', [AdminHeroSlideController::class, 'index']);
        Route::post('/hero-slides', [AdminHeroSlideController::class, 'store']);
        Route::put('/hero-slides/{id}', [AdminHeroSlideController::class, 'update']);
        Route::delete('/hero-slides/{id}', [AdminHeroSlideController::class, 'destroy']);

        Route::get('/why-choose-items', [AdminWhyChooseItemController::class, 'index']);
        Route::post('/why-choose-items', [AdminWhyChooseItemController::class, 'store']);
        Route::put('/why-choose-items/{id}', [AdminWhyChooseItemController::class, 'update']);
        Route::delete('/why-choose-items/{id}', [AdminWhyChooseItemController::class, 'destroy']);

        Route::get('/testimonials', [AdminTestimonialController::class, 'index']);
        Route::post('/testimonials', [AdminTestimonialController::class, 'store']);
        Route::put('/testimonials/{id}', [AdminTestimonialController::class, 'update']);
        Route::delete('/testimonials/{id}', [AdminTestimonialController::class, 'destroy']);

        Route::get('/process-steps', [AdminProcessStepController::class, 'index']);
        Route::post('/process-steps', [AdminProcessStepController::class, 'store']);
        Route::put('/process-steps/{id}', [AdminProcessStepController::class, 'update']);
        Route::delete('/process-steps/{id}', [AdminProcessStepController::class, 'destroy']);

        Route::get('/page-sections', [AdminPageSectionController::class, 'index']);
        Route::post('/page-sections', [AdminPageSectionController::class, 'store']);
        Route::put('/page-sections/{pageSection}', [AdminPageSectionController::class, 'update']);
        Route::delete('/page-sections/{pageSection}', [AdminPageSectionController::class, 'destroy']);

        Route::get('/product-options', [AdminProductOptionsController::class, 'index']);
        Route::post('/product-options/materials', [AdminProductOptionsController::class, 'storeMaterial']);
        Route::delete('/product-options/materials/{material}', [AdminProductOptionsController::class, 'destroyMaterial']);
        Route::post('/product-options/colors', [AdminProductOptionsController::class, 'storeColor']);
        Route::delete('/product-options/colors/{color}', [AdminProductOptionsController::class, 'destroyColor']);
        Route::post('/product-options/sizes', [AdminProductOptionsController::class, 'storeSize']);
        Route::delete('/product-options/sizes/{size}', [AdminProductOptionsController::class, 'destroySize']);
        Route::post('/product-options/buckles', [AdminProductOptionsController::class, 'storeBuckle']);
        Route::delete('/product-options/buckles/{buckle}', [AdminProductOptionsController::class, 'destroyBuckle']);

        Route::get('/shoes', [AdminShoeController::class, 'index']);
        Route::post('/shoes', [AdminShoeController::class, 'store']);
        Route::get('/shoes/{shoe}', [AdminShoeController::class, 'show']);
        Route::put('/shoes/{shoe}', [AdminShoeController::class, 'update']);
        Route::delete('/shoes/{shoe}', [AdminShoeController::class, 'destroy']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{order}', [AdminOrderController::class, 'update']);

        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{user}', [AdminCustomerController::class, 'show']);

        Route::get('/contact-messages', [AdminContactMessageController::class, 'index']);
        Route::get('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'show']);
        Route::patch('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'update']);

        Route::get('/coupons', [AdminCouponController::class, 'index']);
        Route::post('/coupons', [AdminCouponController::class, 'store']);
        Route::put('/coupons/{coupon}', [AdminCouponController::class, 'update']);
        Route::delete('/coupons/{coupon}', [AdminCouponController::class, 'destroy']);
    });
});

<?php



namespace App\Http\Controllers\Api\V1;



use App\Enums\OrderStatus;

use App\Enums\PaymentMethod;

use App\Enums\PaymentStatus;

use App\Http\Controllers\Controller;

use App\Http\Resources\OrderResource;

use App\Models\Order;

use App\Models\User;

use App\Services\PayFastService;

use App\Support\ApiResponse;

use App\Support\GuestContext;

use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Http;

use Illuminate\Validation\Rule;

use Illuminate\Validation\ValidationException;



class PaymentController extends Controller

{

    public function __construct(

        private readonly PayFastService $payFastService,

    ) {}

    public function payfastStatus(): JsonResponse

    {

        return ApiResponse::success([

            'enabled' => $this->payFastService->isConfigured(),

            'mode' => config('payfast.mode'),

        ], 'PayFast status retrieved.');

    }

    public function createPayfastCheckout(Request $request): JsonResponse

    {

        if (! $this->payFastService->isConfigured()) {

            return ApiResponse::error('PayFast is not configured yet. Add merchant credentials to enable card payments.', 503);

        }



        $validated = $request->validate([

            'order_id' => ['required', 'integer', 'exists:orders,id'],

            'customer_email' => ['required', 'email', 'max:255'],

            'customer_mobile' => ['required', 'string', 'max:30'],

        ]);



        $order = Order::query()->findOrFail($validated['order_id']);

        $this->authorizeOrder($request, $order);



        if ($order->payment_method !== PaymentMethod::Payfast) {

            return ApiResponse::error('This order does not use PayFast payment.', 422);

        }



        if ($order->payment_status === PaymentStatus::Paid) {

            return ApiResponse::error('This order has already been paid.', 422);

        }



        try {

            $checkout = $this->payFastService->buildHostedCheckout(

                $order,

                $validated['customer_email'],

                $validated['customer_mobile'],

                $request->ip() ?? '127.0.0.1',

            );

        } catch (\Throwable $exception) {

            return ApiResponse::error($exception->getMessage(), 502);

        }



        return ApiResponse::success($checkout, 'PayFast checkout session created.');

    }



    public function verifyPayfastReturn(Request $request): JsonResponse

    {

        $validated = $request->validate([

            'order_number' => ['required', 'string', 'max:255'],

            'signature' => ['nullable', 'string', 'max:255'],

            'status' => ['required', Rule::in(['success', 'failure'])],

            'transaction_id' => ['nullable', 'string', 'max:255'],

        ]);



        $order = Order::query()

            ->where('order_number', $validated['order_number'])

            ->firstOrFail();



        $this->authorizeOrder($request, $order);



        if ($order->payment_method !== PaymentMethod::Payfast) {

            return ApiResponse::error('This order does not use PayFast payment.', 422);

        }



        if ($order->payment_status === PaymentStatus::Paid) {

            return ApiResponse::success(new OrderResource($order->load(['items.shoe', 'coupon'])), 'Order already paid.');

        }



        if ($validated['status'] === 'failure') {

            $order->update(['payment_status' => PaymentStatus::Failed]);



            return ApiResponse::error('PayFast payment was not completed.', 422);

        }



        if (! $this->payFastService->verifySignature($order, $validated['signature'] ?? null)) {

            return ApiResponse::error('PayFast payment verification failed.', 422);

        }



        $order->update([

            'payment_status' => PaymentStatus::Paid,

            'status' => OrderStatus::Confirmed,

            'payfast_transaction_id' => $validated['transaction_id'] ?? $order->payfast_transaction_id,

        ]);



        return ApiResponse::success(

            new OrderResource($order->fresh(['items.shoe', 'coupon'])),

            'PayFast payment verified.',

        );

    }



    public function payfastIpn(Request $request): JsonResponse

    {

        $orderNumber = $request->input('BASKET_ID')

            ?? $request->input('basket_id')

            ?? $request->input('order_id');



        if (! is_string($orderNumber) || $orderNumber === '') {

            return ApiResponse::error('Missing basket ID.', 422);

        }



        $order = Order::query()->where('order_number', $orderNumber)->first();



        if ($order === null) {

            return ApiResponse::error('Order not found.', 404);

        }



        $signature = $request->input('SIGNATURE') ?? $request->input('signature');

        $transactionId = $request->input('TRANSACTION_ID') ?? $request->input('transaction_id');

        $responseCode = $request->input('RESPONSE_CODE') ?? $request->input('response_code');



        if ($responseCode !== null && ! in_array((string) $responseCode, ['00', '0', '000'], true)) {

            $order->update(['payment_status' => PaymentStatus::Failed]);



            return ApiResponse::success(['accepted' => true], 'Failed payment recorded.');

        }



        if (! $this->payFastService->verifySignature($order, is_string($signature) ? $signature : null)) {

            return ApiResponse::error('Invalid PayFast signature.', 422);

        }



        $order->update([

            'payment_status' => PaymentStatus::Paid,

            'status' => OrderStatus::Confirmed,

            'payfast_transaction_id' => is_string($transactionId) ? $transactionId : $order->payfast_transaction_id,

        ]);



        return ApiResponse::success(['accepted' => true], 'PayFast IPN processed.');

    }

    public function createStripeIntent(Request $request): JsonResponse

    {

        $validated = $request->validate([

            'order_id' => ['required', 'integer', 'exists:orders,id'],

        ]);



        $order = Order::query()->findOrFail($validated['order_id']);

        $this->authorizeOrder($request, $order);



        if ($order->payment_method !== PaymentMethod::Stripe) {

            return ApiResponse::error('This order does not use Stripe payment.', 422);

        }



        if ($order->payment_status === PaymentStatus::Paid) {

            return ApiResponse::error('This order has already been paid.', 422);

        }



        $secret = config('services.stripe.secret');



        if (empty($secret)) {

            return ApiResponse::error('Stripe is not configured.', 503);

        }



        $response = Http::withToken($secret)

            ->asForm()

            ->post('https://api.stripe.com/v1/payment_intents', [

                'amount' => (int) round((float) $order->total * 100),

                'currency' => config('commerce.currency', 'pkr'),

                'metadata[order_id]' => (string) $order->id,

                'metadata[order_number]' => $order->order_number,

            ]);



        if (! $response->successful()) {

            return ApiResponse::error('Unable to create Stripe payment intent.', 502, $response->json());

        }



        $intent = $response->json();



        $order->update([

            'stripe_payment_intent_id' => $intent['id'] ?? null,

        ]);



        return ApiResponse::success([

            'client_secret' => $intent['client_secret'] ?? null,

            'payment_intent_id' => $intent['id'] ?? null,

            'publishable_key' => config('services.stripe.key'),

            'order' => new OrderResource($order->fresh(['items.shoe', 'coupon'])),

        ], 'Stripe payment intent created.');

    }



    public function confirm(Request $request): JsonResponse

    {

        $validated = $request->validate([

            'order_id' => ['required', 'integer', 'exists:orders,id'],

            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],

            'payment_intent_id' => ['nullable', 'string', 'max:255'],

        ]);



        $order = Order::query()->findOrFail($validated['order_id']);

        $this->authorizeOrder($request, $order);



        if ($order->payment_status === PaymentStatus::Paid) {

            return ApiResponse::success(new OrderResource($order->load(['items.shoe', 'coupon'])), 'Order already paid.');

        }



        $paymentMethod = PaymentMethod::from($validated['payment_method']);



        if ($paymentMethod !== $order->payment_method) {

            return ApiResponse::error('Payment method does not match the order.', 422);

        }



        $order = match ($paymentMethod) {

            PaymentMethod::Stripe => $this->confirmStripePayment($order, $validated['payment_intent_id'] ?? $order->stripe_payment_intent_id),

            PaymentMethod::Payfast => $this->confirmPayfastPending($order),

            PaymentMethod::Cod => $this->confirmManualPayment($order, OrderStatus::Confirmed),

            PaymentMethod::BankTransfer => $this->confirmManualPayment($order, OrderStatus::Pending),

        };



        return ApiResponse::success(new OrderResource($order), 'Payment confirmed.');

    }



    private function confirmStripePayment(Order $order, ?string $paymentIntentId): Order

    {

        if ($paymentIntentId === null || $paymentIntentId === '') {

            throw ValidationException::withMessages([

                'payment_intent_id' => ['A Stripe payment intent ID is required.'],

            ]);

        }



        $secret = config('services.stripe.secret');



        if (empty($secret)) {

            throw ValidationException::withMessages([

                'stripe' => ['Stripe is not configured.'],

            ]);

        }



        $response = Http::withToken($secret)

            ->get("https://api.stripe.com/v1/payment_intents/{$paymentIntentId}");



        if (! $response->successful()) {

            throw ValidationException::withMessages([

                'payment_intent_id' => ['Unable to verify Stripe payment intent.'],

            ]);

        }



        $intent = $response->json();

        $status = $intent['status'] ?? null;



        if ($status !== 'succeeded') {

            $order->update(['payment_status' => PaymentStatus::Failed]);



            throw ValidationException::withMessages([

                'payment_intent_id' => ['Stripe payment has not succeeded yet.'],

            ]);

        }



        $order->update([

            'stripe_payment_intent_id' => $paymentIntentId,

            'payment_status' => PaymentStatus::Paid,

            'status' => OrderStatus::Confirmed,

        ]);



        return $order->fresh(['items.shoe', 'coupon']);

    }



    private function confirmPayfastPending(Order $order): Order

    {

        $order->update([

            'payment_status' => PaymentStatus::Pending,

            'status' => OrderStatus::Pending,

        ]);



        return $order->fresh(['items.shoe', 'coupon']);

    }



    private function confirmManualPayment(Order $order, OrderStatus $status): Order

    {

        $order->update([

            'payment_status' => PaymentStatus::Pending,

            'status' => $status,

        ]);



        return $order->fresh(['items.shoe', 'coupon']);

    }



    private function optionalUser(): ?User

    {

        /** @var User|null $user */

        $user = Auth::guard('api')->user();



        return $user;

    }



    private function authorizeOrder(Request $request, Order $order): void

    {

        $user = $this->optionalUser();



        if ($user !== null && $order->user_id === $user->id) {

            return;

        }



        $guestCheckoutToken = GuestContext::checkoutTokenFromRequest($request);



        if ($user === null && $order->user_id === null && $guestCheckoutToken !== null) {

            if ($order->guest_checkout_token === $guestCheckoutToken) {

                return;

            }

        }



        throw ValidationException::withMessages([

            'order' => ['This order does not belong to your checkout session.'],

        ]);

    }

}



<?php



namespace App\Http\Controllers\Api\V1;



use App\Enums\PaymentMethod;

use App\Http\Controllers\Concerns\ResolvesCart;

use App\Http\Controllers\Controller;

use App\Http\Resources\OrderResource;

use App\Models\Order;

use App\Models\User;

use App\Services\CartService;

use App\Services\CheckoutService;

use App\Support\ApiResponse;

use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

use Illuminate\Validation\Rule;

use Illuminate\Validation\ValidationException;



class OrderController extends Controller

{

    use ResolvesCart;



    public function __construct(

        private readonly CartService $cartService,

        private readonly CheckoutService $checkoutService,

    ) {}



    public function index(Request $request): JsonResponse

    {

        $orders = $this->authenticatedUser()

            ->orders()

            ->with(['items.shoe', 'coupon'])

            ->latest()

            ->paginate((int) $request->query('per_page', 10));



        return ApiResponse::success([

            'items' => OrderResource::collection($orders),

            'pagination' => [

                'current_page' => $orders->currentPage(),

                'last_page' => $orders->lastPage(),

                'per_page' => $orders->perPage(),

                'total' => $orders->total(),

            ],

        ]);

    }



    public function show(Order $order): JsonResponse

    {

        $this->authorizeOrder($order);



        $order->load(['items.shoe', 'coupon']);



        return ApiResponse::success(new OrderResource($order));

    }



    public function store(Request $request): JsonResponse

    {

        $user = $this->optionalUser();



        $validated = $request->validate([

            'guest_email' => [$user === null ? 'required' : 'nullable', 'email', 'max:255'],

            'shipping_address_id' => ['nullable', 'integer', 'exists:shipping_addresses,id'],

            'shipping_address' => ['nullable', 'array'],

            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],

            'coupon_code' => ['nullable', 'string', 'max:50'],

            'notes' => ['nullable', 'string', 'max:2000'],

        ]);



        if ($user === null && isset($validated['shipping_address_id'])) {

            throw ValidationException::withMessages([

                'shipping_address_id' => ['Saved addresses are only available for signed-in customers.'],

            ]);

        }



        $cart = $this->resolveCart($request, $this->cartService);



        $shippingAddress = $this->checkoutService->resolveShippingAddress(

            $user,

            $validated['shipping_address_id'] ?? null,

            $validated['shipping_address'] ?? null,

        );



        $order = $this->checkoutService->createOrder(

            $user,

            $cart,

            $shippingAddress,

            PaymentMethod::from($validated['payment_method']),

            $validated['coupon_code'] ?? null,

            $validated['notes'] ?? null,

            $validated['guest_email'] ?? null,

        );



        return ApiResponse::success(new OrderResource($order), 'Order placed successfully.', 201);

    }



    private function authenticatedUser(): User

    {

        /** @var User $user */

        $user = Auth::guard('api')->user();



        return $user;

    }



    private function authorizeOrder(Order $order): void

    {

        if ($order->user_id !== $this->authenticatedUser()->id) {

            throw ValidationException::withMessages([

                'order' => ['This order does not belong to your account.'],

            ]);

        }

    }

}



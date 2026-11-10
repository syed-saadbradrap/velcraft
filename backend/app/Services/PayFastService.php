<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PayFastService
{
    public function isConfigured(): bool
    {
        return filled(config('payfast.merchant_id')) && filled(config('payfast.secured_key'));
    }

    public function baseUrl(): string
    {
        return config('payfast.mode') === 'live'
            ? rtrim((string) config('payfast.live_url'), '/')
            : rtrim((string) config('payfast.sandbox_url'), '/');
    }

    public function checkoutUrl(): string
    {
        return $this->baseUrl().'/checkout';
    }

    public function getAccessToken(string $customerIp): string
    {
        $response = Http::asForm()
            ->timeout(30)
            ->post($this->baseUrl().'/token', [
                'merchant_id' => config('payfast.merchant_id'),
                'secured_key' => config('payfast.secured_key'),
                'grant_type' => config('payfast.grant_type'),
                'customer_ip' => $customerIp,
            ]);

        if (! $response->successful()) {
            Log::error('PayFast token request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException('Unable to connect to PayFast. Please try again.');
        }

        $payload = $response->json();
        $token = data_get($payload, 'data.token') ?? data_get($payload, 'token');

        if (! is_string($token) || $token === '') {
            Log::error('PayFast token missing in response', ['payload' => $payload]);

            throw new RuntimeException('PayFast authentication failed.');
        }

        return $token;
    }

    public function buildHostedCheckout(Order $order, string $email, string $mobile, string $customerIp): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('PayFast is not configured yet.');
        }

        $merchantId = (string) config('payfast.merchant_id');
        $merchantName = (string) config('payfast.merchant_name');
        $amount = number_format((float) $order->total, 2, '.', '');
        $basketId = $order->order_number;
        $signature = $this->makeSignature($merchantId, $merchantName, $amount, $basketId);
        $accessToken = $this->getAccessToken($customerIp);

        $frontendUrl = rtrim((string) config('payfast.frontend_url'), '/');
        $successUrl = $frontendUrl.'/checkout/payment/return?status=success&order='.urlencode($basketId);
        $failureUrl = $frontendUrl.'/checkout/payment/return?status=failure&order='.urlencode($basketId);
        $callbackQuery = http_build_query([
            'signature' => $signature,
            'order' => $basketId,
        ]);

        $order->update([
            'payfast_basket_id' => $basketId,
            'payfast_signature' => $signature,
        ]);

        return [
            'checkout_url' => $this->checkoutUrl(),
            'basket_id' => $basketId,
            'amount' => (float) $amount,
            'fields' => [
                'MERCHANT_ID' => $merchantId,
                'MERCHANT_NAME' => $merchantName,
                'TOKEN' => $accessToken,
                'PROCCODE' => '00',
                'TXNAMT' => $amount,
                'CUSTOMER_MOBILE_NO' => $this->normalizeMobile($mobile),
                'CUSTOMER_EMAIL_ADDRESS' => $email,
                'SIGNATURE' => $signature,
                'VERSION' => (string) config('payfast.version'),
                'TXNDESC' => 'Velcraft order '.$basketId,
                'SUCCESS_URL' => $successUrl,
                'FAILURE_URL' => $failureUrl,
                'BASKET_ID' => $basketId,
                'ORDER_DATE' => now()->format('Y-m-d H:i:s'),
                'CHECKOUT_URL' => urlencode($callbackQuery),
            ],
        ];
    }

    public function verifySignature(Order $order, ?string $signature): bool
    {
        if ($signature === null || $signature === '') {
            return false;
        }

        $merchantId = (string) config('payfast.merchant_id');
        $merchantName = (string) config('payfast.merchant_name');
        $amount = number_format((float) $order->total, 2, '.', '');
        $basketId = $order->order_number;

        return hash_equals($this->makeSignature($merchantId, $merchantName, $amount, $basketId), $signature);
    }

    public function makeSignature(string $merchantId, string $merchantName, string $amount, string $basketId): string
    {
        return md5($merchantId.':'.$merchantName.':'.$amount.':'.$basketId);
    }

    private function normalizeMobile(string $mobile): string
    {
        $digits = preg_replace('/\D+/', '', $mobile) ?? '';

        if (str_starts_with($digits, '92') && strlen($digits) === 12) {
            return '0'.substr($digits, 2);
        }

        if (str_starts_with($digits, '0')) {
            return $digits;
        }

        return $digits !== '' ? $digits : '03000000000';
    }
}

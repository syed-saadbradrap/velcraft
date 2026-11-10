<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Stripe = 'stripe';
    case Payfast = 'payfast';
    case Cod = 'cod';
    case BankTransfer = 'bank_transfer';
}

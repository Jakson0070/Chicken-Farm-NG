<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\Order;
use App\Models\User;

class NotificationService
{
    public function orderEvent(Order $order, string $event, array $payload = []): void
    {
        $this->log('email', $order, $event, $payload);
    }

    public function orderEventSms(Order $order, string $event, array $payload = []): void
    {
        $this->log('sms', $order, $event, $payload);
    }

    private function log(string $channel, Order $order, string $event, array $payload = []): void
    {
        NotificationLog::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'channel' => $channel,
            'event' => $event,
            'payload' => $payload,
        ]);
    }
}

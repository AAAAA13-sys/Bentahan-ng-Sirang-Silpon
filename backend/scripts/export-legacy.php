<?php

declare(strict_types=1);

// This file contains password hashes. Keep the export inside ignored .data.
try {
    $root = dirname(__DIR__, 2);
    require $root.'/vendor/autoload.php';
    $app = require $root.'/bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $timezone = (string) config('app.timezone', 'UTC');
    $timestamp = static function ($value) use ($timezone): ?string {
        return $value === null ? null : Illuminate\Support\Carbon::parse($value, $timezone)->utc()->toIso8601String();
    };
    $data = Illuminate\Support\Facades\DB::transaction(function () use ($timestamp): array {
        $users = Illuminate\Support\Facades\DB::table('users')->orderBy('id')->get(['id', 'name', 'email', 'password', 'email_verified_at', 'role', 'location', 'seller_verified', 'created_at', 'updated_at'])->map(function ($row) use ($timestamp) {
            foreach (['created_at', 'updated_at', 'email_verified_at'] as $key) $row->$key = $timestamp($row->$key);
            return $row;
        })->all();
        $listings = Illuminate\Support\Facades\DB::table('listings')->orderBy('id')->get()->map(function ($row) use ($timestamp) {
            foreach (['created_at', 'updated_at'] as $key) $row->$key = $timestamp($row->$key);
            return $row;
        })->all();
        $orders = Illuminate\Support\Facades\DB::table('orders')->orderBy('id')->get()->map(function ($row) use ($timestamp) {
            foreach (['created_at', 'updated_at', 'received_at'] as $key) $row->$key = $timestamp($row->$key);
            return $row;
        })->all();
        return ['version' => 1, 'users' => $users, 'listings' => $listings, 'orders' => $orders];
    });
    $directory = dirname(__DIR__).'/.data';
    if (!is_dir($directory) && !mkdir($directory, 0700, true)) throw new RuntimeException('Cannot create export directory.');
    $temporary = tempnam($directory, 'legacy-');
    if ($temporary === false) throw new RuntimeException('Cannot create export file.');
    try {
        chmod($temporary, 0600);
        if (file_put_contents($temporary, json_encode($data, JSON_THROW_ON_ERROR), LOCK_EX) === false) throw new RuntimeException('Cannot write export.');
        if (!rename($temporary, $directory.'/legacy-import.json')) throw new RuntimeException('Cannot finalize export.');
    } finally {
        if (is_file($temporary)) unlink($temporary);
    }
    printf("Exported %d users, %d listings, %d orders.\n", count($data['users']), count($data['listings']), count($data['orders']));
} catch (Throwable $error) {
    fwrite(STDERR, "Legacy export failed. Check local configuration and file permissions.\n");
    exit(1);
}

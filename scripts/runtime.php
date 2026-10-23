<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$driver = config('database.default');
$connection = config('database.connections.'.$driver);
if (in_array('--info', $argv, true)) {
    echo json_encode(['driver' => $driver, 'host' => $connection['host'] ?? '', 'port' => (int) ($connection['port'] ?? 3306), 'has_key' => (bool) config('app.key')], JSON_THROW_ON_ERROR);
    exit(0);
}
try {
    DB::connection()->getPdo();
    foreach (['users', 'listings', 'orders'] as $table) {
        if (! Schema::hasTable($table)) {
            throw new RuntimeException('Schema missing');
        }
    }
    $pending = $app->make('migrator')->getMigrationFiles(database_path('migrations'));
    $ran = $app->make('migration.repository')->getRan();
    if (array_diff(array_keys($pending), $ran)) {
        fwrite(STDERR, "Database updates are pending. Run php artisan migrate, then start again.\n");
        exit(1);
    }
    echo "Database connected and schema ready.\n";
} catch (Throwable $error) {
    fwrite(STDERR, "Database is not ready. Check XAMPP/MySQL and the DB settings in .env. See README.md for first-time setup.\n");
    exit(1);
}

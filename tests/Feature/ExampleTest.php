<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_renders_with_an_empty_catalog(): void
    {
        $this->get('/')->assertOk()->assertSee('Be the first to list a part.');
    }
}

<?php

namespace Fauzan\MalaysiaMap;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class MalaysiaMapServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/resources/views', 'msia-map');

        Blade::component('msia-map', 'msia-map::components.map');

        $this->publishes([
            __DIR__ . '/../dist/MsiaMap.js' => public_path('vendor/malaysia-map/js/MsiaMap.js'),
            __DIR__ . '/../dist/css' => public_path('vendor/malaysia-map/css'),
        ], 'malaysia-map-assets');
    }
}

@props([
    'id' => 'msia-map',
    'lat' => null,
    'lng' => null,
    'height' => '500px',
    'zoom' => null,
    'onRegionClick' => null,
])

<link rel="stylesheet" href="{{ asset('vendor/malaysia-map/css/style.css') }}">
<div id="{{ $id }}" style="height: {{ $height }}; width: 100%;"></div>

<script type="module">
    import MsiaMap from '{{ asset('vendor/malaysia-map/js/MsiaMap.js') }}';

    const options = {};
    @if($lat !== null && $lng !== null)
    options.center = [{{ $lat }}, {{ $lng }}];
    @endif
    @if($zoom !== null)
    options.zoom = {{ $zoom }};
    @endif
    @if($onRegionClick)
    options.onRegionClick = {{ $onRegionClick }};
    @endif

    window.msiaMap_{{ $id }} = new MsiaMap('{{ $id }}', options);
</script>

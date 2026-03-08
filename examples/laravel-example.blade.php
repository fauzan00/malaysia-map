<!-- Laravel Blade Example -->

<!-- Basic Usage -->
<x-msia-map 
    id="basic-map" 
    height="500px" 
/>

<!-- With Custom Center and Zoom -->
<x-msia-map 
    id="custom-map" 
    :lat="3.139" 
    :lng="101.6869" 
    :zoom="8"
    height="600px" 
/>

<!-- With JavaScript Interaction -->
<x-msia-map 
    id="interactive-map" 
    height="500px" 
/>

<script>
    // Access the map instance
    const map = window.msiaMap_interactive_map;
    
    // Add markers
    map.addStateMarker('Kuala Lumpur', 3.139, 101.6869);
    map.addStateMarker('Penang', 5.4164, 100.3327);
    
    // Set custom click handler
    map.onRegionClick((feature) => {
        console.log('Clicked state:', feature.properties.name);
    });
</script>

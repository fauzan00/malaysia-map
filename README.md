# Malaysia Map Library

A lightweight, interactive SVG-based map library for displaying Malaysia's states with statistical data visualization capabilities.

## Features

- 🗺️ Interactive SVG map of Malaysia with all states
- 🖱️ Pan and zoom functionality
- 📍 Add custom markers with popups
- 🎯 Click events on regions/states
- 📦 Works with vanilla JavaScript and Laravel
- 🎨 Customizable styling via CSS
- 📊 Perfect for data visualization

## Installation

### For Laravel Projects

```bash
composer require fauzan/malaysia-map
```

Publish assets:
```bash
php artisan vendor:publish --tag=malaysia-map-assets
```

### For Vanilla JavaScript Projects

1. Build the library:
```bash
npm install
npm run build
```

2. Copy `dist/MsiaMap.js` and `dist/css/style.css` to your project

## Usage

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="dist/css/style.css">
</head>
<body>
  <div id="my-map" style="height: 500px; width: 100%;"></div>

  <script type="module">
    import MsiaMap from './dist/MsiaMap.js';

    // Initialize map
    const map = new MsiaMap('my-map', {
      center: [4.2105, 101.9758], // [lat, lng]
      zoom: 6,
      onRegionClick: (feature) => {
        console.log('Clicked:', feature.properties.name);
      }
    });

    // Add markers
    map.addStateMarker('Kuala Lumpur', 3.139, 101.6869);
  </script>
</body>
</html>
```

### Laravel Blade Component

```blade
<x-msia-map 
    id="malaysia-map" 
    :lat="4.2105" 
    :lng="101.9758" 
    :zoom="6"
    height="600px" 
/>
```

## API Reference

### Constructor Options

```javascript
new MsiaMap(containerId, options)
```

- `containerId` (string): ID of the container element
- `options` (object):
  - `center` (array): [latitude, longitude] - Map center coordinates
  - `zoom` (number): Initial zoom level (3-12)
  - `geoData` (object|string): Custom GeoJSON data (optional)
  - `onRegionClick` (function): Callback when a region is clicked

### Methods

#### addStateMarker(name, lat, lng)
Add a marker to the map.

```javascript
const marker = map.addStateMarker('Kuala Lumpur', 3.139, 101.6869);
// Remove marker
marker.remove();
```

#### onRegionClick(callback)
Set click handler for regions.

```javascript
map.onRegionClick((feature) => {
  alert(`You clicked: ${feature.properties.name}`);
});
```

## Customization

### CSS Styling

Customize the map appearance by overriding CSS classes:

```css
.vectormap-region {
  fill: #e8eef4;
  stroke: #5a8fc4;
  stroke-width: 1;
}

.vectormap-region:hover {
  fill: #c5d9ed;
}

.vectormap-marker-dot {
  fill: #d32f2f;
  stroke: #fff;
  stroke-width: 2;
}
```

## Development

```bash
# Install dependencies
npm install

# Build library
npm run build

# Test locally
npm run preview
```

## States Included

- Perlis, Kedah, Pulau Pinang, Perak
- Kelantan, Terengganu, Pahang
- Selangor, Kuala Lumpur, Putrajaya
- Negeri Sembilan, Melaka, Johor
- Sarawak, Labuan, Sabah

## License

MIT

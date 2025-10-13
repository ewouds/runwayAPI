# Airport Search Demo

An interactive HTML demo page that showcases the Airport Database API with real-time ICAO code search functionality.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open the demo:**
   - Visit: http://localhost:3002/demo
   - Or run: `npm run demo:web`

## ✨ Features

### Real-time Search
- **Auto-search**: Starts searching after typing 3 characters
- **Debounced**: 300ms delay to prevent excessive API calls
- **Live updates**: Results update as you type
- **Case insensitive**: Automatically converts to uppercase

### Smart Highlighting
- **Search term highlighting**: Matching text is highlighted in yellow
- **Multiple field search**: Searches name, ICAO code, IATA code, and municipality
- **Partial matching**: Find airports with partial codes (e.g., "EGL" finds all EGLL, EGLC, etc.)

### Rich Results Display
- **Airport codes**: Color-coded ICAO (red) and IATA (green) badges
- **Airport details**: Location, elevation, coordinates, service type
- **Clickable results**: Click any airport for detailed information
- **Mobile responsive**: Works on all screen sizes

### Error Handling
- **Network errors**: Clear error messages for connection issues
- **No results**: Friendly message when no airports are found
- **API errors**: Proper handling of API error responses

## 🎯 Usage Examples

### Basic Search
1. Type "EGL" to find London airports (EGLL, EGLC, etc.)
2. Type "LFP" to find Paris airports (LFPG, LFPO, etc.)
3. Type "EDD" to find German airports (EDDF, EDDM, etc.)

### Advanced Features
- **Press F1**: Cycle through example searches
- **Click airports**: View detailed information
- **Watch API calls**: See the actual API URL being called

## 🔧 Technical Details

### API Integration
- Uses the `/api/v1/airports/search` endpoint
- Implements proper error handling and loading states
- Shows the actual API URL being called for transparency

### Performance Optimizations
- **Debouncing**: Prevents excessive API calls while typing
- **Caching**: Browser caches results for better performance
- **Limit results**: Limits to 20 results for optimal display

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement (works without JavaScript for basic functionality)

## 📱 Mobile Experience

The demo is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Optimized layout for small screens
- Smooth scrolling and interactions

## 🎨 Styling

- **Modern design**: Clean, professional appearance
- **Gradient backgrounds**: Eye-catching visual design
- **Color coding**: Different colors for ICAO vs IATA codes
- **Hover effects**: Interactive feedback
- **Loading animations**: Visual feedback during searches

## 🔍 Search Tips

1. **ICAO codes** are typically 4 letters (e.g., EGLL, LFPG, EDDF)
2. **Start with 3 characters** to begin searching
3. **Use common prefixes**:
   - `EG*` - United Kingdom airports
   - `LF*` - French airports  
   - `ED*` - German airports
   - `LI*` - Italian airports
   - `LE*` - Spanish airports

## 🎮 Demo Shortcuts

- **F1**: Cycle through example searches (EGL → LFP → EDD → EGK)
- **Enter**: Trigger search manually
- **Click airport**: View detailed information popup

## 🌐 Live Demo Features

When you open the demo, you can:

1. **Test live search** by typing airport codes
2. **See API calls** in real-time at the bottom
3. **Click results** to get detailed airport information
4. **Experience error handling** by searching invalid codes
5. **Test mobile** by resizing your browser window

## 📊 What You'll See

The demo searches through:
- **12,228 airports** across 52 European countries
- **118 large airports** including major international hubs
- **659 airports** with scheduled passenger service
- **Multiple types**: Large, medium, small airports, heliports, seaplane bases

Perfect for demonstrating the comprehensive nature of the airport database API!
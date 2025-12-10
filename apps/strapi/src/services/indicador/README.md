# Economic Indicators Service

This service provides an interface to fetch and manage Chilean economic indicators using the [mindicador.cl](https://mindicador.cl) API.

## Key Features

- Retrieval of economic indicators (UF, Dollar, Euro, UTM, CPI)
- Local caching system for performance optimization
- Automatic data updates when needed
- Standardized response format in English
- Currency conversion between CLP, USD, and EUR
- Robust error handling
- Decoupled HTTP client implementation

## Service Structure

```
src/services/indicador/
├── README.md
├── indicador.service.ts    # Main service implementation
├── interfaces.ts          # Type and interface definitions
├── http-client.ts        # HTTP client for API requests
├── factory.ts            # Factory for service instantiation
└── indicators.json       # Local cache file (automatically generated)
```

## Components

### HTTP Client

The service uses a decoupled HTTP client that:

- Implements the `IHttpClient` interface
- Wraps axios for HTTP requests
- Provides centralized error handling
- Makes the service more testable
- Allows easy replacement of the HTTP library if needed

Example of HTTP client usage:

```typescript
const httpClient = new HttpClient();
const data = await httpClient.get("https://mindicador.cl/api");
```

### Cache System

The service implements a smart caching system that:

1. Stores data in a local JSON file
2. Verifies the last update date
3. Automatically updates when:
   - Cache file doesn't exist
   - Data is outdated (different day)
   - Indicators array is empty
   - Error occurs while reading cache

## Service Usage

### Get All Indicators

```typescript
const service = new IndicadorService(new HttpClient());
const result = await service.getIndicators();

// Result:
{
  date: "2024-03-30T12:00:00.000Z",
  indicators: [
    {
      code: "uf",
      name: "Unidad de fomento (UF)",
      unit: "Pesos",
      value: 38889.1
    },
    // ... other indicators
  ]
}
```

### Get Specific Indicator

```typescript
const service = new IndicadorService(new HttpClient());
const ufIndicator = await service.getIndicator('uf');

// Result:
{
  code: "uf",
  name: "Unidad de fomento (UF)",
  unit: "Pesos",
  value: 38889.1
}
```

### Currency Conversion

The service provides currency conversion between CLP (Chilean Peso), USD (US Dollar), and EUR (Euro). By default, it converts from CLP to USD if no currencies are specified:

```typescript
const service = new IndicadorService(new HttpClient());

// Convert CLP to USD (default behavior)
const clpToUsd = await service.convert(100000);
// Result: 107.32 (if USD = 931.75 CLP)

// Explicitly specify currencies
const usdToClp = await service.convert(100, "USD", "CLP");
// Result: 93175 (if USD = 931.75 CLP)

const clpToEur = await service.convert(50000, "CLP", "EUR");
// Result: 49.70 (if EUR = 1005.99 CLP)

const eurToUsd = await service.convert(75, "EUR", "USD");
// Result: 81.03 (using CLP as intermediate currency)
```

Notes about currency conversion:

- Default conversion is from CLP to USD if no currencies are specified
- Uses the latest exchange rates from the cache
- Converts through CLP when converting between USD and EUR
- Throws `ConversionError` if:
  - Required exchange rates are not available
  - Invalid currency codes are provided
  - Cache is not initialized

## Available Indicators

| Code  | Description                |
| ----- | -------------------------- |
| uf    | Development Unit (UF)      |
| dolar | Observed Dollar            |
| euro  | Euro                       |
| utm   | Monthly Tax Unit (UTM)     |
| ipc   | Consumer Price Index (CPI) |

## Technical Details

### Initialization

The service initializes asynchronously in the constructor:

1. Checks for cache file existence
2. Reads and validates existing data
3. Updates if necessary

### Data Format

Indicators are transformed into a standardized English format:

```typescript
interface Indicator {
  code: string; // Indicator code (e.g., 'uf')
  name: string; // Descriptive name
  unit: string; // Unit of measurement
  value: number; // Current value
}
```

### Error Handling

The service handles various error scenarios:

- Cache file read/write errors
- API response errors
- Corrupt or invalid data

In all cases, it attempts to recover by fetching fresh data from the API.

## Integration Example

```typescript
import { IndicadorFactory } from "./factory";

// Using the factory (recommended)
const service = IndicadorFactory.createIndicadorService();

// Or creating an instance directly
const service = new IndicadorService(new HttpClient());

// Get all indicators
const allIndicators = await service.getIndicators();

// Get specific indicator
const dolar = await service.getIndicator("dolar");
```

## Cache Maintenance

The cache updates automatically when:

- Service starts and data is outdated
- Cache file doesn't exist
- Data is corrupt or empty

No manual cache maintenance is required.

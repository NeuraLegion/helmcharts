# Chaotic Shop Helm Chart

This Helm chart deploys the Chaotic Shop application, a mock internet shop that generates pages randomly but reproducibly. It is useful for testing web scraping and debugging with reproducible products and categories.

## Parameters

The following parameters can be configured when deploying the chart:

- `global.env.CATEGORY_CHAOS`: Controls the mutations for products in the same category. Default is `0` (no mutations).
- `global.env.PRODUCT_CHAOS`: Controls the mutations for individual products. Default is `0` (no mutations).
- `global.env.NUMBER_OF_PRODUCTS`: Specifies the number of products to generate. Default is `1000`.

## Examples

### Basic Installation

To install the chart with default settings:

```sh
helm upgrade --install --namespace distributor test . --wait
```

### Custom Chaos Degree

To set a specific chaos degree for the application:

```sh
helm upgrade --install test \
  --set global.env.CHAOS_DEGREE=1 . --wait
```

### Custom Product and Category Chaos

To configure product and category chaos along with the number of products:

```sh
helm upgrade --install test \
  --set global.env.PRODUCT_CHAOS=2 \
  --set global.env.CATEGORY_CHAOS=2 \
  --set global.env.NUMBER_OF_PRODUCTS=1000 . --wait
```

## Accessing the Application

Once deployed, the application will be accessible at the configured ingress URL or service endpoint.

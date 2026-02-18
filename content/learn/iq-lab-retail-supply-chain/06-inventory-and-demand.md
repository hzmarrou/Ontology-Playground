---
title: "Step 5: Inventory & Demand"
slug: inventory-and-demand
description: Add Inventory, Forecast, and DemandSignal to track stock levels and predict future demand across warehouses and regions.
order: 6
embed: official/iq-lab-retail-step-5
---

## From transactions to planning

Steps 1–4 modelled what **has happened** — orders, shipments, deliveries. Now we add entities for what **is happening** (inventory levels, demand signals) and what **will happen** (forecasts). This is where ontology really shines: unifying historical, real-time, and predictive data under one model.

## Inventory

Stock levels at each warehouse:

| Property | Type | Identifier? |
|---|---|---|
| `inventoryId` | string | ✓ |
| `stockLevel` | integer | |
| `reorderPoint` | integer | |

The `reorderPoint` indicates the threshold below which new stock should be ordered — a critical metric for supply chain management.

## Forecast

Predicted demand for products:

| Property | Type | Identifier? |
|---|---|---|
| `forecastId` | string | ✓ |
| `forecastDate` | date | |
| `predictedDemand` | integer | |

## DemandSignal

Real-time indicators of customer demand — search trends, social media mentions, weather patterns:

| Property | Type | Identifier? |
|---|---|---|
| `signalId` | string | ✓ |
| `signalDate` | datetime | |
| `signalStrength` | decimal | |

## New relationships

Five new relationships connect inventory and demand to existing entities:

- **InventoryForProduct** — `Inventory` → `Product` (many-to-one)
  Stock level for a specific product.

- **InventoryAtWarehouse** — `Inventory` → `Warehouse` (many-to-one)
  Where the inventory is stored. Combined with InventoryForProduct, this creates the intersection: "How much of Product X is at Warehouse Y?"

- **ForecastForProduct** — `Forecast` → `Product` (many-to-one)
  Predicted demand for a specific product.

- **DemandSignalForProduct** — `DemandSignal` → `Product` (many-to-one)
  Real-time demand indicator for a product.

- **DemandSignalInRegion** — `DemandSignal` → `Region` (many-to-one)
  Where the demand signal originated.

## Cross-source unification

In a real Fabric IQ deployment, these entities might come from very different sources:

| Entity | Typical source |
|---|---|
| Inventory | Eventhouse (real-time updates) |
| Forecast | Lakehouse (batch ML predictions) |
| DemandSignal | Eventhouse (streaming data) |
| Product | Both Lakehouse (catalog) and Eventhouse (discounts) |

The ontology **unifies all of these** under a single connected graph. A query like "For products with high demand signals in the southwest, what's the current inventory at nearby warehouses?" traverses across all sources seamlessly.

## The graph at Step 5

<ontology-embed id="official/iq-lab-retail-step-5" height="450px" />

*Thirteen entity types. Inventory links Product to Warehouse. DemandSignal connects Product to Region. The graph now spans commerce, logistics, and planning domains.*

## What we learned

- Ontologies can unify **historical, real-time, and predictive** data
- **Inventory** is a classic intersection entity — it sits between Product and Warehouse
- **DemandSignal** connects to both Product and Region, enabling cross-dimensional analysis
- Cross-source unification is the core value proposition — one model, multiple data engines

One more step: we'll add Promotion and Return to complete the picture.

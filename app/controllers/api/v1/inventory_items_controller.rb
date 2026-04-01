class Api::V1::InventoryItemsController < ApplicationController
  # GET /api/v1/inventory_items
  # High-Concurrency Optimized: Eager loads products to prevent N+1 overhead
  def index
    @inventory = InventoryItem.includes(:product).all

    # We serialize the data with specific inclusions to keep the JSON payload lean.
    # This reduces 'Transfer Rate' overhead in your 'ab' benchmarks.
    render json: @inventory.as_json(
      only: [:id, :warehouse_id, :product_id, :quantity, :updated_at],
      include: { 
        product: { 
          only: [:name, :sku] 
        } 
      }
    )
  end

  # GET /api/v1/inventory_items/stats
  # SQL-level aggregation for sub-millisecond global reporting
  def stats
    render json: {
      total_network_stock: InventoryItem.sum(:quantity),
      active_hubs: Warehouse.count,
      last_sync: InventoryItem.maximum(:updated_at)
    }
  end
end

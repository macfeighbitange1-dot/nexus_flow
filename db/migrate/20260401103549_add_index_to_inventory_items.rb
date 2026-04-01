class AddIndexToInventoryItems < ActiveRecord::Migration[8.0]
  def change
    # High-performance composite index for sub-millisecond lookups
    add_index :inventory_items, [:warehouse_id, :product_id], unique: true
  end
end

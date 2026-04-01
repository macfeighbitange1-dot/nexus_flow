class CreateInventoryItems < ActiveRecord::Migration[8.0]
  def change
    create_table :inventory_items do |t|
      t.references :warehouse, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, default: 0, null: false

      t.timestamps
    end

    # Database-level constraint: Quantity can NEVER be negative.
    # This is the "Zero-Trust" architecture principle.
    execute "ALTER TABLE inventory_items ADD CONSTRAINT quantity_non_negative CHECK (quantity >= 0);"
    
    # Integrity: One product cannot have two separate rows in one warehouse.
    add_index :inventory_items, [:warehouse_id, :product_id], unique: true
  end
end

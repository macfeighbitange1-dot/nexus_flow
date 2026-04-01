class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.string :name
      t.string :sku
      t.jsonb :metadata

      t.timestamps
    end
    add_index :products, :sku
  end
end

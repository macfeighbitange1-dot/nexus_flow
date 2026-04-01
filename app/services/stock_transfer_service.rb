class StockTransferService
  def self.call(product_id:, from_warehouse_id:, to_warehouse_id:, amount:)
    ActiveRecord::Base.transaction do
      # 1. Pessimistic Locking: Freezes rows to prevent race conditions
      from_stock = InventoryItem.lock.find_by!(product_id: product_id, warehouse_id: from_warehouse_id)
      to_stock   = InventoryItem.lock.find_or_initialize_by(product_id: product_id, warehouse_id: to_warehouse_id)

      # 2. Business Logic Execution
      from_stock.quantity -= amount
      to_stock.quantity ||= 0
      to_stock.quantity += amount

      # 3. Persistent Save (Triggers PostgreSQL CHECK constraints)
      from_stock.save!
      to_stock.save!

      # 4. Redis Broadcast: Real-time update for React
      ActionCable.server.broadcast("inventory_channel", {
        product_id: product_id,
        changes: [
          { warehouse_id: from_warehouse_id, new_quantity: from_stock.quantity },
          { warehouse_id: to_warehouse_id, new_quantity: to_stock.quantity }
        ],
        timestamp: Time.current
      })

      # 5. ASYNCHRONOUS AUDIT (Sidekiq)
      # We offload the 'heavy' logging to the Sidekiq engine. 
      # The UI doesn't have to wait for this file write.
      TransferAuditJob.perform_later({
        product_id: product_id,
        from_id: from_warehouse_id,
        to_id: to_warehouse_id,
        amount: amount,
        occurred_at: Time.current
      })

      true
    end
  rescue ActiveRecord::RecordNotFound
    { success: false, error: "Source stock record not found in Nairobi Hub." }
  rescue ActiveRecord::RecordInvalid, ActiveRecord::StatementInvalid => e
    # This catches the PG::CheckViolation for negative stock
    { success: false, error: "Transfer failed: Insufficient stock or integrity error." }
  rescue => e
    { success: false, error: "System Error: #{e.message}" }
  end
end

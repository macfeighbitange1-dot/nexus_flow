Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Inventory Management & Intelligence
      resources :inventory_items, only: [:index] do
        # 'on: :collection' creates /api/v1/inventory_items/stats
        # This is for global aggregates across all warehouses.
        get :stats, on: :collection
      end

      # Atomic Stock Transfers
      resources :stock_transfers, only: [:create]
    end
  end

  # Real-Time WebSocket Hub (Redis-backed)
  mount ActionCable.server => '/cable'
end

class InventoryChannel < ApplicationCable::Channel
  def subscribed
    stream_from "inventory_channel"
  end
end

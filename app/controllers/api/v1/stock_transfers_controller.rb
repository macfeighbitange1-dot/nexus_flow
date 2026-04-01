class Api::V1::StockTransfersController < ApplicationController
  def create
    result = StockTransferService.call(
      product_id: params[:product_id],
      from_warehouse_id: params[:from_warehouse_id],
      to_warehouse_id: params[:to_warehouse_id],
      amount: params[:amount].to_i
    )

    if result == true
      render json: { message: "Transfer successful" }, status: :ok
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end
end

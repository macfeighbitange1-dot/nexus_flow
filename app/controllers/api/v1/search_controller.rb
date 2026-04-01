class Api::V1::SearchController < ApplicationController
  def index
    query = params[:q]
    
    if query.present?
      # Postgres '@@' is the match operator for Full-Text Search
      # We combine Name and SKU into a single searchable vector
      @products = Product.where(
        "to_tsvector('english', name || ' ' || sku) @@ plainto_tsquery('english', ?)", 
        query
      ).limit(20)
    else
      @products = Product.none
    end

    render json: @products
  end
end

source "https://rubygems.org"

ruby "3.3.0"

# Using Rails 8.0.0 to avoid ActionView SyntaxErrors on Ruby 3.3.0
gem "rails", "~> 8.0.0"

# PostgreSQL: The high-concurrency source of truth
gem "pg", "~> 1.1"

# Puma: The high-performance multi-threaded web server
gem "puma", ">= 5.0"

# Redis: The real-time messaging layer for ActionCable
gem "redis", ">= 4.0"

# CORS: Allows the React dashboard to talk to this API
gem "rack-cors"

# Connection Pool: Pinned to < 3.0 to maintain Ruby 3.3.0 compatibility
gem "connection_pool", "< 3.0"

# Rails 8 high-performance defaults
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# Reduces boot times through caching
gem "bootsnap", require: false

# Deployment tooling
gem "kamal", require: false

# Windows compatibility (Crucial for WSL/Ubuntu environments)
gem "tzinfo-data", platforms: %i[ windows jruby ]

group :development, :test do
  gem "debug", platforms: %i[ mri windows ]
end

group :development do
  gem "rack-proxy"
end

gem "sidekiq", "~> 8.0"

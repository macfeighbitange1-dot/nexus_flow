require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module NexusFlow
  class Application < Rails::Application
    # Standard Rails 8.0 configuration
    config.load_defaults 8.0

    # Ensure our custom libraries are autoloaded properly
    config.autoload_lib(ignore: %w[assets tasks])

    # --- 0.1% PERFORMANCE CONFIGURATION ---
    
    # 1. Background Job Adapter
    # We set this to :sidekiq so Redis handles our task queue.
    config.active_job.queue_adapter = :sidekiq

    # 2. Regional Localization
    # Setting this to Nairobi ensures our inventory timestamps 
    # match the local Kenya business day.
    config.time_zone = "Nairobi"

    # 3. API-Only Middleware
    # Optimized for high-speed JSON responses, skipping unnecessary 
    # browser-related middleware (cookies/sessions).
    config.api_only = true
  end
end

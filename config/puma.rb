# --- 0.1% PERFORMANCE ENGINE CONFIGURATION ---

# 1. Threading Strategy
# Each 'worker' (process) will have a pool of threads. 
# We set this to 5 to balance IO-wait vs CPU overhead.
threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
threads threads_count, threads_count

# 2. Clustered Mode (The Power Move)
# 'Workers' are separate processes. On a modern Ubuntu machine, 
# setting this to 2 or 'auto' allows true parallelism.
workers ENV.fetch("WEB_CONCURRENCY") { 2 }

# 3. Port & Networking
port ENV.fetch("PORT", 3000)

# 4. Environment
environment ENV.fetch("RAILS_ENV") { "development" }

# 5. Performance Hooks
# 'Preload' loads the entire Rails app in the parent process before 
# forking workers. This saves RAM via Copy-on-Write (CoW).
preload_app!

# 6. Database Connection Management
# Ensure each worker establishes its own connection to PostgreSQL.
on_worker_boot do
  ActiveRecord::Base.establish_connection
end

# 7. Plugins & Process Management
plugin :tmp_restart
plugin :solid_queue if ENV["SOLID_QUEUE_IN_PUMA"]
pidfile ENV["PIDFILE"] if ENV["PIDFILE"]

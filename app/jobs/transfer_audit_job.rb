class TransferAuditJob < ApplicationJob
  queue_as :default

  def perform(details)
    # Simulate a heavy computational task (e.g., PDF generation or external API sync)
    sleep 2
    
    # Write to a dedicated audit log
    File.open("log/inventory_audits.log", "a") do |f|
      f.puts "[#{Time.current}] AUDIT SUCCESS: Moved #{details['amount']} units of #{details['product_id']} from Warehouse #{details['from_id']} to #{details['to_id']}"
    end
    
    puts ">>> Sidekiq: Audit Logged for Transfer #{details['product_id']}"
  end
end

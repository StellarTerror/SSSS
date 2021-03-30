class AddColumnToShiftRequest < ActiveRecord::Migration[5.0]
  def change
    add_column :shift_requests, :shift_status, :integer
  end
end
